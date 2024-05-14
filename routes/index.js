import AppController from "../controllers/AppController";

export function MountEndpoints (api) {
  api.get('/status', AppController.getStatus);
  api.get('/stats', AppController.getStats);
}
