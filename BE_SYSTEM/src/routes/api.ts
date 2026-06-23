import express, { Express } from 'express';
import { UserController } from 'controllers/user.controller';
import { isLogin, isAdmin } from 'middleware/auth';
import { LoginController } from 'controllers/auth.controller';
import { SyncController } from 'controllers/sync.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Quản lý tài khoản người dùng
 *   - name: Health Check
 *     description: Kiểm tra server
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id_username:
 *           type: string
 *           example: gv001
 *         email:
 *           type: string
 *           example: gv001@school.edu.vn
 *         phone:
 *           type: string
 *           example: "0909123456"
 *         role:
 *           type: string
 *           enum: [admin, teacher]
 *           example: teacher
 *     CreateUserInput:
 *       type: object
 *       required: [id_username, email, password, role]
 *       properties:
 *         id_username:
 *           type: string
 *           example: gv001
 *         email:
 *           type: string
 *           example: gv001@school.edu.vn
 *         password:
 *           type: string
 *           example: "123456"
 *         phone:
 *           type: string
 *           example: "0909123456"
 *         role:
 *           type: string
 *           enum: [admin, teacher]
 *           example: teacher
 *     UpdateUserInput:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           example: newemail@school.edu.vn
 *         phone:
 *           type: string
 *           example: "0909999999"
 *         role:
 *           type: string
 *           enum: [admin, teacher]
 */

const apiRoutes = (app: Express) => {
  /**
   * @swagger
   * /api:
   *   get:
   *     summary: Health check
   *     tags: [Health Check]
   *     responses:
   *       200:
   *         description: Server đang chạy
   */
  router.get('/', (req, res) => {
    res.json({ message: 'API System is running!', success: true });
  });

  // ==================== USER ROUTES ====================

  /**
   * @swagger
   * /api/users:
   *   get:
   *     summary: Lấy danh sách tất cả user
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/User'
   *       401:
   *         description: Chưa đăng nhập
   */
  router.get('/users', isLogin, UserController.getAll);

  /**
   * @swagger
   * /api/users/{id}:
   *   get:
   *     summary: Lấy thông tin 1 user
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Username (id_username)
   *         example: gv001
   *     responses:
   *       200:
   *         description: Thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *       404:
   *         description: Không tìm thấy user
   */
  router.get('/users/:id', isLogin, UserController.getOne);

  /**
   * @swagger
   * /api/users:
   *   post:
   *     summary: Tạo user mới (chỉ admin)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateUserInput'
   *     responses:
   *       201:
   *         description: Tạo thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       409:
   *         description: Username hoặc email đã tồn tại
   */
  router.post('/users', UserController.create);

  /**
   * @swagger
   * /api/users/{id}:
   *   put:
   *     summary: Cập nhật thông tin user (chỉ admin)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         example: gv001
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateUserInput'
   *     responses:
   *       200:
   *         description: Cập nhật thành công
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       404:
   *         description: Không tìm thấy user
   */
  router.put('/users/:id', isLogin, isAdmin, UserController.update);

  /**
   * @swagger
   * /api/users/{id}:
   *   delete:
   *     summary: Xoá user (chỉ admin)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         example: gv001
   *     responses:
   *       200:
   *         description: Xoá thành công
   *       404:
   *         description: Không tìm thấy user
   */
  router.delete('/users/:id', isLogin, isAdmin, UserController.remove);

  /**
   * @swagger
   * /api/users/search:
   *   get:
   *     summary: Tìm kiếm user theo vai trò (chỉ admin)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: role
   *         required: true
   *         schema:
   *           type: string
   *         example: teacher
   *     responses:
   *       200:
   *         description: Tìm kiếm thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/User'
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       404:
   *         description: Không tìm thấy user
   */
  router.post('/users/search', isLogin, UserController.searchUsersByRole);

  // ==================== LOGIN ROUTES ====================
  /**
   * @swagger
   * /api/login:
   *   post:
   *     summary: Đăng nhập
   *     tags: [Login]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 example: admin@school.edu.vn
   *               password:
   *                 type: string
   *                 example: "123456"
   *     responses:
   *       200:
   *         description: Đăng nhập thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     user:
   *                       type: object
   *                       properties:
   *                         userId:
   *                           type: string
   *                           example: cmpp81xlw0000vhso5oyo7tb8
   *                         email:
   *                           type: string
   *                           example: admin@school.edu.vn
   *                         role:
   *                           type: string
   *                           example: ADMIN
   *                         fullName:
   *                           type: string
   *                           example: Admin
   *                     accessToken:
   *                       type: string
   *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       401:
   *         description: Email hoặc mật khẩu không chính xác
   */
  router.post('/login', LoginController.login);

  /**
   * @swagger
   * /api/refresh:
   *   post:
   *     summary: Làm mới access token bằng refresh token (Cookie)
   *     tags: [Login]
   *     responses:
   *       200:
   *         description: Cập nhật token thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     user:
   *                       type: object
   *                       properties:
   *                         userId:
   *                           type: string
   *                         email:
   *                           type: string
   *                         role:
   *                           type: string
   *                         fullName:
   *                           type: string
   *                     accessToken:
   *                       type: string
   *       401:
   *         description: Refresh token không hợp lệ hoặc đã hết hạn
   */
  router.post('/refresh', LoginController.refresh);

  /**
   * @swagger
   * /api/logout:
   *   post:
   *     summary: Đăng xuất
   *     tags: [Login]
   *     responses:
   *       200:
   *         description: Đăng xuất thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                   example: Đăng xuất thành công
   *       500:
   *         description: Lỗi server khi đăng xuất
   */
  router.post('/logout', LoginController.logout);

  /**
   * @swagger
   * /api/me:
   *   get:
   *     summary: Lấy thông tin user hiện tại
   *     tags: [Login]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     userId:
   *                       type: string
   *                     email:
   *                       type: string
   *                     role:
   *                       type: string
   *                     fullName:
   *                       type: string
   *       401:
   *         description: Không có phiên đăng nhập
   */
  router.get('/me', isLogin, LoginController.getMe);
  // ==================== SYNC ROUTES ====================
  router.post('/sync', SyncController.syncData);

  app.use('/api', router);
};

export default apiRoutes;
