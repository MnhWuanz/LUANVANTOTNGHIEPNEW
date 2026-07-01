import { createBrowserRouter } from 'react-router-dom';


import AuthLayout from '../layouts/AuthLayout';

import MainLayout from '@/app/layouts/MainLayout';

import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import AuthLogin from '@/features/auth/pages/AuthLogin';

import UserProfilePage from '@/features/users/pages/UserProfilePage';
import KioskPage from '@/features/kisok/pages/kioskPage';
import DashboardRouter from '@/features/dashboard/pages/DashboardRouter';
import AttendanceSessionPage from '@/features/attendance-sessions/pages/AttendanceSessionPage';
import TeacherPage from '@/features/teachers/pages/TeacherPage';
import FaceEnrollmentPage from '@/features/face-enrollment/pages/FaceEnrollmentPage';



export const router = createBrowserRouter([
  /******************** AUTH *********************/
  {
    element: <ProtectedRoute requireAuth={false} />,
    children: [
      {
        path: '/auth',
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: <AuthLogin />,
          },

        ],
      },
    ],
  
  },


  /******************** MAIN *********************/
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: (
            <MainLayout />
        ),
        children: [
          /************ CHUNG (ADMIN + TEACHER) ************/
          {
            index: true,
            element: <DashboardRouter />
          },
          {
            path: 'profile',
            element: <UserProfilePage />,
          },

          /************ CHỈ ADMIN ************/
          {
            element: <RoleRoute allowedRoles={['ADMIN']} />,
            children: [
              {
                path: 'kiosks',
                element: <KioskPage />
              },
              {
                path: 'attendance-sessions',
                element: <AttendanceSessionPage />
              },
              {
                path: 'students',
                // element: <StudentPage />,
              },
              {
                path: 'teachers',
                element: <TeacherPage />,
              },
              {
                path: 'courses',
                // element: <CoursePage />,
              },
              {
                path: 'enrollments',
                // element: <EnrollmentPage />,
              },
            ],
          },

          /************ CHỈ TEACHER ************/
          {
            element: <RoleRoute allowedRoles={['TEACHER']} />,
            children: [
              {
                path: 'face-enrollment',
                element: <FaceEnrollmentPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
