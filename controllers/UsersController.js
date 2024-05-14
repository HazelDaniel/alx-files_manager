/* eslint-disable import/no-named-as-default */
import sha1 from 'sha1';
import Queue from 'bull/lib/queue';
import dbClient from '../utils/db';

const userQueue = new Queue('email sending');

export default class UsersController {
  static async postNew(req, res) {
    const emailData = req.body;
    const email = emailData ? emailData.email : null;
    const password = emailData ? emailData.password : null;

    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }

    const existingUser = await (await dbClient.usersCollection()).findOne({ email });

    if (existingUser) {
      res.status(400).json({ error: 'Already exist' });
      return;
    }

    const hashedPassword = sha1(password);
    const insertionInfo = await (await dbClient.usersCollection()).insertOne({
      email,
      password: hashedPassword,
    });
    const userId = insertionInfo.insertedId.toString();

    userQueue.add({ userId });
    res.status(201).json({ email, id: userId });
  }

  static async getMe(req, res) {
		try {
			const { user } = req;

			res.status(200).json({ email: user.email, id: user._id.toString() });
		} catch (err) {
			console.log(err);
		}
  }
}
