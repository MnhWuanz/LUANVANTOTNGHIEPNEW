import express, { Express } from 'express';
import { isLogin, isAdmin } from 'middleware/auth';
//import { LoginController } from 'controllers/auth.controller';
import { SyncController } from 'controllers/sync.controller';
import { verifyTrainingApiKey } from 'middleware/training.midleware';

const router = express.Router();

const apiRoutes = (app: Express) => {
  // ==================== USER ROUTES ====================

  // ==================== AUTH ROUTES ====================

  // router.post('/login', LoginController.login);

  // router.post('/refresh', LoginController.refresh);

  // router.post('/logout', LoginController.logout);

  // router.get('/me', isLogin, LoginController.getMe);
  // ==================== SYNC ROUTES ====================

  router.post('/sync', verifyTrainingApiKey, SyncController.syncData);
  router.get('/sync-batches', SyncController.getSynBathches);
  router.get('/sync-check', verifyTrainingApiKey, (req, res) => {
    res.json({ message: 'System Sync is running!', success: true });
  });
  app.use('/api', router);
};
export default apiRoutes;
