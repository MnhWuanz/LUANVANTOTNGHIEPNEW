import { createBrowserRouter } from 'react-router-dom';


import AuthLayout from '../layouts/AuthLayout';

import MainLayout from '@/app/layouts/MainLayout';

import ProtectedRoute from './ProtectedRoute';
import AuthLogin from '@/features/auth/pages/AuthLogin';

import UserProfilePage from '@/features/users/pages/UserProfilePage';
import KioskPage from '@/features/kisok/pages/kioskPage';
import DashBoardPage from '@/features/dashboard/pages/DashBoard';



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
          {
            index: true,
            element: <DashBoardPage />
          },
          {
            path: 'profile',
            element: <UserProfilePage />,
          },
          {
            path: 'kiosks',
            element: <KioskPage />
          },
          {
            path: 'students',
            // element: <StudentPage />,
          },
          {
            path: 'teachers',
            // element: <TeacherPage />,
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
    ],
  },
]);


