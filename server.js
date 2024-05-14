import express from 'express';

const app = express();

const startServer = (api) => {
  const port = process.env.PORT || 5000;
  const env = process.env.npm_lifecycle_event || 'dev';

	api.use(express.json({limit: '200mb'}));
  api.get('/status', AppController.getStatus);
  api.get('/stats', AppController.getStats);

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
