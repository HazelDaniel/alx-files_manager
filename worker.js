/* eslint-disable import/no-named-as-default */
import dbClient from './utils/db';
import imgThumbnail from 'image-thumbnail';
import Mailer from './utils/mailer';
import mongoDBCore from 'mongodb/lib/core';
import { promisify } from 'util';
import Queue from 'bull/lib/queue';
import { writeFile } from 'fs';

const writeFileAsync = promisify(writeFile);
const fileQueue = new Queue('thumbnail generation');
const userQueue = new Queue('email sending');

/**
 * Generates the thumbnail of an image with a given width size.
 * @param {String} filePath The location of the original file.
 * @param {number} size The width of the thumbnail.
 */
const generateThumbnail = async (filePath, size) => {
  const buffer = await imgThumbnail(filePath, { width: size });
  console.log(`Generating thumbnail for ${filePath} (size: ${size})`);
  return writeFileAsync(`${filePath}_${size}`, buffer);
};

fileQueue.process(async (job) => {
  const fileId = job.data.fileId;
  const userId = job.data.userId;

  if (!fileId) {
    throw new Error('Missing fileId');
  }
  if (!userId) {
    throw new Error('Missing userId');
  }

  const file = await (await dbClient.filesCollection())
    .findOne({
      _id: new mongoDBCore.BSON.ObjectId(fileId),
      userId: new mongoDBCore.BSON.ObjectId(userId),
    });

  if (!file) {
    throw new Error('File not found');
  }

  const sizes = [500, 250, 100];
  try {
    await Promise.all(sizes.map((size) => generateThumbnail(file.localPath, size)));
    console.log(`Thumbnails generated for ${file.localPath}`);
  } catch (err) {
    console.error('Error generating thumbnails:', err.message);
    throw err;
  }
});

userQueue.process(async (job) => {
  const userId = job.data.userId;

  if (!userId) throw new Error('Missing userId');

  const user = await (await dbClient.usersCollection())
    .findOne({ _id: new mongoDBCore.BSON.ObjectId(userId) });

  if (!user) throw new Error('User not found');

  console.log(`Welcome ${user.email}!`);
  try {
    const mailSubject = 'Welcome to ALX-Files_Manager by Daniel Emmanuel';

    const mailBody = [
      '<div>',
      `<h3>Hello ${user.name || user.email},</h3>`,
      'Welcome to <a href="https://github.com/HazelDaniel/alx-files_manager">',
      'ALX-Files_Manager</a>, ',
      'Here goes a file management API powered by nodejs',
      '<a href="https://github.com/HazelDaniel">Daniel Emmanuel</a>. ',
      '</div>',
    ].join('');

    Mailer.sendMail(Mailer.createMessage(user.email, mailSubject, mailBody));
    console.log(`Welcome email sent to ${user.email}`);
  } catch (err) {
    console.error('Error sending welcome email:', err.message);
    throw err;
  }
});
