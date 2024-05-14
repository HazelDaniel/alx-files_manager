import express from 'express';
import { MountEndpoints } from './routes';
import { getUserFromAuthorization, getUserFromXToken } from './utils/auth';

const app = express();

/* MIDDLEWARES */

/**
 * Applies Basic authentication to a route.
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 * @param {NextFunction} next The Express next function.
 */
export const basicAuthenticate = async (req, res, next) => {
	try {
		const user = await getUserFromAuthorization(req);
		if (!user) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}
		req.user = user;
		next();
	} catch (err) {
		console.log("we got here");
		return res.status(500).json({error: 'Internal Server Error'});
	}
};

/**
 * Applies X-Token authentication to a route.
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 * @param {NextFunction} next The Express next function.
 */
export const xTokenAuthenticate = async (req, res, next) => {
  const user = await getUserFromXToken(req);

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.user = user;
  next();
};

/* END OF MIDDLEWARES */

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

export default app;
