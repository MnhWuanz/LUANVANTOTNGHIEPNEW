/// <reference path="./types/index.d.ts" />

import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from 'config/swagger';
import apiRoutes from 'routes/api';

import { createServer } from 'http';
import {
  generateAttendanceSession,
  updateAttendanceSessionStatuses,
} from 'services/attendance_session.service';
import cron from 'node-cron';

const app = express();
const PORT = process.env.PORT || 8080;
// Config CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

//Cron - auto generate
cron.schedule(
  '5 0 * * *',
  async () => {
    await generateAttendanceSession(new Date());
  },
  {
    timezone: 'Asia/Ho_Chi_Minh',
  },
);

//Cron - auto open/close attendance sessions
cron.schedule(
  '* * * * *',
  async () => {
    await updateAttendanceSessionStatuses();
  },
  {
    timezone: 'Asia/Ho_Chi_Minh',
  },
);

// Config body parser & cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Create HTTP server
const httpServer = createServer(app);

apiRoutes(app);
generateAttendanceSession().catch((error) => {
  console.error('Generate attendance sessions failed:', error);
});
updateAttendanceSessionStatuses().catch((error) => {
  console.error('Update attendance session statuses failed:', error);
});
// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});
httpServer.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
