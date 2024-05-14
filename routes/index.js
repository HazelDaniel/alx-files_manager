import AppController from "../controllers/AppController";
import UsersController from "../controllers/UsersController";
import AuthController from "../controllers/AuthController";
import { xTokenAuthenticate } from "../server";

export function MountEndpoints (api) {
  api.get('/status', AppController.getStatus);
  api.get('/stats', AppController.getStats);
	api.post('/users', UsersController.postNew);
	api.get('/users/me', UsersController.getMe);

  api.get('/disconnect', xTokenAuthenticate, AuthController.getDisconnect);
}
