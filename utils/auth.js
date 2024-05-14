/* eslint-disable import/no-named-as-default */
/* eslint-disable no-unused-vars */
import sha1 from 'sha1';
import { Request } from 'express';
import mongoDBCore from 'mongodb/lib/core';
import dbClient from './db';
import redisClient from './redis';

/**
 * Fetches the user based on the Basic authentication credentials provided in the Authorization header.
 * @param {Request} req The Express request object.
 * @returns {Promise<Document | null>} A Mongoose document representing the user or null if not found.
 */
export const getUserFromAuthorization = async (req) => {
  const authHeader = req.headers.authorization || null;

  if (!authHeader) {
    return null;
  }

  const [authType, encodedCredentials] = authHeader.split(' ');

  if (authType !== 'Basic' || !encodedCredentials) {
    return null;
  }

  const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString();
  const [email, password] = decodedCredentials.split(':');

  const user = await (await dbClient.usersCollection()).findOne({ email });

  if (!user || sha1(password) !== user.password) {
    return null;
  }

  return user;
};

/**
 * Fetches the user based on the X-Token header value.
 *
 * @param {Request} req The Express request object.
 * @returns {Promise<Document | null>} A Mongoose document representing the user or null if not found.
 */
export const getUserFromXToken = async (req) => {
  const token = req.headers['x-token'];

  if (!token) {
    return null;
  }

  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) {
    return null;
  }

  const user = await (await dbClient.usersCollection())
    .findOne({ _id: new mongoDBCore.BSON.ObjectId(userId) });

  return user || null;
};

export default {
  getUserFromAuthorization,
  getUserFromXToken,
};
