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
import {
  handleAttendanceFaceImageUpload,
  handleFaceImageUpload,
} from 'middleware/upload.middleware';
import { UserController } from 'controllers/user.controller';
import { KioskController } from 'controllers/kiosk.controller';
import { RoomController } from 'controllers/room.controller';
import { DashboardController } from 'controllers/dashboard.controller';
import { CourseClassController } from 'controllers/course_class.controller';
import { TeacherDashboardController } from 'controllers/teacher_dashboard.controller';
import { AttendanceRecordController } from 'controllers/attendance_record.controller';
import { StudentPortalController } from 'controllers/student_portal.controller';
import { verifyStudentPortalApiKey } from 'middleware/student_portal.middleware';

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
    '/attendance-sessions/kiosk/current',
    AttendanceRecordController.getCurrentKioskSession,
  );
  router.get(
    '/attendance-sessions/kiosk/today',
    AttendanceRecordController.getTodayKioskSessions,
  );
  router.get(
    '/attendance-sessions',
    isLogin,
    isAdmin,
    AttendanceSessionController.getAllSessions,
  );
  router.post(
    '/attendance-records/check-in',
    handleAttendanceFaceImageUpload,
    AttendanceRecordController.checkIn,
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
  // ==================== STUDENT PORTAL ROUTES ====================
  router.get(
    '/student-portal/students/:studentCode/attendance',
    verifyStudentPortalApiKey,
    StudentPortalController.getStudentAttendance,
  );
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
  router.delete(
    '/kiosks/:id_kiosk/delete',
    isLogin,
    isAdmin,
    KioskController.deleteKisosk,
  );
  router.get('/kiosks/health', (req, res) => {
    res.json({ status: 'ok', system: 'kiosk' });
  });
  // ==================== COURSE CLASS ROUTES (TEACHER) ====================
  router.get(
    '/teachers/me/course-classes',
    isLogin,
    isTeacher,
    CourseClassController.getMyCourseClasses,
  );
  router.get(
    '/teachers/me/course-classes/:courseClassId/schedules',
    isLogin,
    isTeacher,
    CourseClassController.getCourseClassSchedules,
  );
  router.get(
    '/teachers/me/course-classes/:courseClassId/students',
    isLogin,
    isTeacher,
    CourseClassController.getStudentsByCourseClass,
  );
  router.get(
    '/teachers/me/attendance-sessions/:attendanceSessionId/students',
    isLogin,
    isTeacher,
    CourseClassController.getAttendanceSessionStudents,
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
