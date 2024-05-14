import AppController from "../controllers/AppController";
import UsersController from "../controllers/UsersController";

export function MountEndpoints (api) {
  api.get('/status', AppController.getStatus);
  api.get('/stats', AppController.getStats);
	api.post('/users', UsersController.postNew);
}
