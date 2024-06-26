import AppController from "../controllers/AppController";
import UsersController from "../controllers/UsersController";
import AuthController from "../controllers/AuthController";
import { xTokenAuthenticate, basicAuthenticate } from "../server";
import FilesController from "../controllers/FilesController";

export function MountEndpoints (api) {
  api.get('/status', AppController.getStatus);

  api.get('/stats', AppController.getStats);

	api.post('/users', UsersController.postNew);
	api.get('/users/me', UsersController.getMe);

  api.get('/connect', basicAuthenticate, AuthController.getConnect);
  api.get('/disconnect', xTokenAuthenticate, AuthController.getDisconnect);

	api.post('/files', xTokenAuthenticate, FilesController.postUpload)
  api.get('/files/:id', xTokenAuthenticate, FilesController.getShow);
  api.get('/files', xTokenAuthenticate, FilesController.getIndex);
  api.put('/files/:id/publish', xTokenAuthenticate, FilesController.putPublish);
  api.put('/files/:id/unpublish', xTokenAuthenticate, FilesController.putUnpublish);
  api.get('/files/:id/data', FilesController.getFile);
}
