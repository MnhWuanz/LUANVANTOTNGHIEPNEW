import express, { Express } from 'express';
import { SyncController } from 'controllers/sync.controller';
import { verifyTrainingApiKey } from 'middleware/training.midleware';
import {
  authLogin,
  authLogout,
  authMe,
  authRefreshToken,
} from 'controllers/auth.controller';
import { authMiddleware } from 'middleware/auth.midleware';
import { isAdmin, isLogin } from 'middleware/auth';
import { AttendanceSessionController } from 'controllers/attendance_session.controller';

const router = express.Router();

const apiRoutes = (app: Express) => {
  // ==================== USER ROUTES ====================

  // ==================== ATTENDANCE ROUTES ====================
  router.post(
    '/attendace-sessions/generate',
    isLogin,
    isAdmin,
    AttendanceSessionController.generateSession,
  );
  router.get(
    '/attendance-sessions',
    isLogin,
    isAdmin,
    AttendanceSessionController.getAllSessions,
  );
  // ==================== AUTH ROUTES ====================
  router.post('/auth/login', authLogin);
  router.post('/auth/logout', isLogin, authLogout);
  router.get('/auth/me', isLogin, authMe);
  router.post('/auth/refresh', authRefreshToken);
  // ==================== SYNC ROUTES ====================
  router.post('/sync', verifyTrainingApiKey, SyncController.syncData);
  router.get('/sync-batches', isLogin, isAdmin, SyncController.getSynBathches);
  router.get('/sync-check', verifyTrainingApiKey, (req, res) => {
    res.json({ message: 'System Sync is running!', success: true });
  });
  app.use('/api', router);
};
export default apiRoutes;
