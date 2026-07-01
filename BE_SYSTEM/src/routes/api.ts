import express, { Express } from 'express';
import { SyncController } from 'controllers/sync.controller';
import { verifyTrainingApiKey } from 'middleware/training.midleware';
import {
  authLogin,
  authLogout,
  authMe,
  authRefreshToken,
} from 'controllers/auth.controller';
import { isAdmin, isLogin, isTeacher } from 'middleware/auth';
import { AttendanceSessionController } from 'controllers/attendance_session.controller';
import { FaceEnrollmentController } from 'controllers/face_enrollment.controller';
import { handleFaceImageUpload } from 'middleware/upload.middleware';
import { UserController } from 'controllers/user.controller';
import { KioskController } from 'controllers/kiosk.controller';
import { RoomController } from 'controllers/room.controller';
import { DashboardController } from 'controllers/dashboard.controller';
import { CourseClassController } from 'controllers/course_class.controller';
import { TeacherDashboardController } from 'controllers/teacher_dashboard.controller';

const router = express.Router();

const apiRoutes = (app: Express) => {
  // ==================== DASHBOARD ROUTES ====================
  router.get('/dashboard', isLogin, isAdmin, DashboardController.getDashboard);
  router.get(
    '/dashboard/teacher',
    isLogin,
    isTeacher,
    TeacherDashboardController.getTeacherDashboard,
  );

  // ==================== USER ROUTES ====================
  router.get('/users', isLogin, isAdmin, UserController.getAllUser);
  router.get(
    '/users/:id_teacher',
    isLogin,
    isAdmin,
    UserController.getTeacherById,
  );

  router.patch(
    '/teachers/me',
    isLogin,
    isTeacher,
    UserController.updateMyTeacher,
  );
  router.patch(
    '/teachers/:id_teacher',
    isLogin,
    isAdmin,
    UserController.updateTeacher,
  );
  // ==================== ATTENDANCE_SESSION ROUTES ====================
  router.post(
    '/attendance-sessions/generate',
    isLogin,
    isAdmin,
    AttendanceSessionController.generateSession,
  );
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
  // ==================== FACE ENROLLMENT ROUTES ====================
  router.post(
    '/students/:studentId/face-enrollments',
    isLogin,
    isTeacher,
    handleFaceImageUpload,
    FaceEnrollmentController.enrollFace,
  );

  // ==================== KIOSK ROUTES ====================
  router.post(
    '/kiosks/generate-code',
    isLogin,
    isAdmin,
    KioskController.createKioskCode,
  );
  router.post('/kiosks/activate', KioskController.activateKiosk);
  router.get('/kiosks', isLogin, isAdmin, KioskController.getAllKiosk);
  // ==================== COURSE CLASS ROUTES (TEACHER) ====================
  router.get(
    '/teachers/me/course-classes',
    isLogin,
    isTeacher,
    CourseClassController.getMyCourseClasses,
  );
  router.get(
    '/teachers/me/course-classes/:courseClassId/students',
    isLogin,
    isTeacher,
    CourseClassController.getStudentsByCourseClass,
  );
  // ==================== ROOM ROUTES ====================
  router.get(
    '/rooms/available-for-kiosk',
    isLogin,
    isAdmin,
    RoomController.getAvailableRoomsForKiosk,
  );
  router.get('/rooms', isLogin, RoomController.getAllRoom);
  app.use('/api', router);
};
export default apiRoutes;



