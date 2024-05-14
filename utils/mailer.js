/* eslint-disable no-unused-vars */
import fs from 'fs';
import readline from 'readline';
import { promisify } from 'util';
import mimeMessage from 'mime-message';
import { gmail_v1 as gmailV1, google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = 'token.json';
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
async function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error('Error retrieving access token', err);
        return;
      }
      oAuth2Client.setCredentials(token);
      writeFileAsync(TOKEN_PATH, JSON.stringify(token))
        .then(() => {
          console.log('Token stored to', TOKEN_PATH);
          callback(oAuth2Client);
        })
        .catch((writeErr) => console.error(writeErr));
    });
  });
}


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(clientCredentials, authorizeCallback) {
  // Extract credentials for OAuth2 client
  const secretKey = clientCredentials.web.client_secret;
  const clientID = clientCredentials.web.client_id;
  const redirectUris = clientCredentials.web.redirect_uris;

  // Create a new OAuth2 client
  const oauthClient = new google.auth.OAuth2(clientID, secretKey, redirectUris[0]);
  console.log('Starting client authorization process...');

  // Check for existing stored token
  try {
    const tokenData = await readFileAsync(TOKEN_PATH);
    oauthClient.setCredentials(JSON.parse(tokenData));
    authorizeCallback(oauthClient); // Pass authorized client to callback
  } catch (error) {
    // If no stored token, initiate process to get a new one
    await getNewToken(oauthClient, authorizeCallback);
  }

  console.log('Client authorization completed.');
}


/**
 * Sends an email through the user's Gmail account using the authorized client.
 * @param {google.auth.OAuth2} authorizedClient The authorized OAuth2 client.
 * @param {gmailV1.Schema$Message} email The email message to send.
 */
function sendMailService(authorizedClient, email) {
  const googleMail = google.gmail({ version: 'v1', auth: authorizedClient });

  googleMail.users.messages.send({
    userId: 'me',
    requestBody: email,
  }, (err) => {
    if (err) {
      console.error('Error sending email:', err.message || err.toString());
      return;
    }
    console.log('Email sent successfully!');
  });
}

/**
 * Contains routines for mail delivery with GMail.
 */
export default class Mailer {
  static checkAuth() {
    readFileAsync('credentials.json')
      .then(async (content) => {
        await authorize(JSON.parse(content), (auth) => {
          if (auth) {
            console.log('Auth check was successful');
          }
        });
      })
      .catch((err) => {
        console.log('Error loading client secret file:', err);
      });
  }

  static createMessage(dest, subject, message) {
    const senderEmail = process.env.GMAIL_SENDER;
    const msgData = {
      type: 'text/html',
      encoding: 'UTF-8',
      from: senderEmail,
      to: [dest],
      cc: [],
      bcc: [],
      replyTo: [],
      date: new Date(),
      subject,
      body: message,
    };

    if (!senderEmail) {
      throw new Error(`Invalid sender: ${senderEmail}`);
    }
    if (mimeMessage.validMimeMessage(msgData)) {
      const mimeMsg = mimeMessage.createMimeMessage(msgData);
      return { raw: mimeMsg.toBase64SafeString() };
    }
    throw new Error('Invalid MIME message');
  }

  static sendMail(mail) {
    readFileAsync('credentials.json')
      .then(async (content) => {
        await authorize(
          JSON.parse(content),
          (auth) => sendMailService(auth, mail),
        );
      })
      .catch((err) => {
        console.log('Error loading client secret file:', err);
      });
  }
}
