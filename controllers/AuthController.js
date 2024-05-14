/* eslint-disable import/no-named-as-default */
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';

export default class AuthController {
  static async getConnect(req, res) {
		try {
			const { user } = req;
			console.log("[DEBUGGING]: ");
			console.log("the user retrieved is :", user);
			const tokenGenerated = uuidv4();

			await redisClient.set(`auth_${tokenGenerated}`, user._id.toString(), 24 * 60 * 60);
			return res.status(200).json({ token: tokenGenerated });
		} catch (err) {
			return res.status(500).json({error: 'Internal Server Error'});
		}
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    await redisClient.del(`auth_${token}`);
    res.status(204).send();
  }
}
