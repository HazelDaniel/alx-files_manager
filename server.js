import express from 'express';
import { MountEndpoints } from './routes';

const app = express();

/**
 * Represents an error in this API.
 */
export class APIError extends Error {
  constructor(code, message) {
    super();
    this.code = code || 500;
    this.message = message;
  }
}

/**
 * This middleware generate a custom error response
 * @param {Error} err The error object.
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 * @param next The Express next function.
 */
export const errorResponse = (err, req, res, next) => {
  const defaultMsg = `Failed to process ${req.url}`;

  if (err instanceof APIError) {
    res.status(err.code).json({ error: err.message || defaultMsg });
    return;
  }
  return res.status(500).json({
    error: err ? err.message || err.toString() : defaultMsg,
  });
};


const startServer = (api) => {
  const port = process.env.PORT || 5000;
  const env = process.env.npm_lifecycle_event || 'dev';

	api.use(express.json({limit: '200mb'}));

	MountEndpoints(api);

  api.all('*', (req, res, next) => {
    errorResponse(new APIError(404, `Cannot ${req.method} ${req.url}`), req, res, next);
  });

  api.use(errorResponse);

  api.listen(port, () => {
    console.log(`[${env}] API has started listening at port:${port}`);
  });
};

startServer(app);

export default server;
