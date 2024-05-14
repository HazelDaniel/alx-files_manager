// eslint-disable-next-line no-unused-vars
import Collection from "mongodb/lib/collection";
import { MongoClient } from 'mongodb';

/**
 * Represents a MongoDB client connection and provides methods for interacting with MongoDB.
 */
class DBClient {
  /**
   * Creates a new DBClient instance and establishes a connection to the MongoDB server.
   * Uses environment variables for configuration.
   */
  constructor() {

		const host = process.env.DB_HOST || 'localhost';
		const port = process.env.DB_PORT || 27017;
		const database = process.env.DB_DATABASE || 'files_manager';

    const dbUrl = `mongodb://${host}:${port}/${database}`;

    this.mongoClient = new MongoClient(dbUrl, { useUnifiedTopology: true });
    this.mongoClient.connect();
  }

  /**
   * Checks if the current connection to the MongoDB server is active.
   * @returns {boolean} True if connected, false otherwise.
   */
  isAlive() {
    return this.mongoClient.isConnected();
  }

  /**
   * Retrieves the number of documents in the "users" collection.
   * @returns {Promise<number>} Resolves to the number of user documents.
   */
  async nbUsers() {
    const usersCollection = await this.client.db().collection('users');
    return usersCollection.countDocuments();
  }

  /**
   * Retrieves the number of documents in the "files" collection.
   * @returns {Promise<number>} Resolves to the number of file documents.
   */
  async nbFiles() {
    const filesCollection = await this.client.db().collection('files');
    return filesCollection.countDocuments();
  }

  /**
   * Retrieves a reference to the "users" collection.
   * @returns {Promise<Collection>} Resolves to a reference to the users collection.
   */
  async usersCollection() {
    return this.client.db().collection('users');
  }

  /**
   * Retrieves a reference to the "files" collection.
   * @returns {Promise<Collection>} Resolves to a reference to the files collection.
   */
  async filesCollection() {
    return this.client.db().collection('files');
  }

  get client() {
    return this.mongoClient;
  }
}

export const dbClient = new DBClient();
export default dbClient;
