import { createBrowserRouter } from 'react-router-dom';

import AppInit from '../init/AppInit';

import AuthLayout from '../layouts/AuthLayout';

import MainLayout from '@/app/layouts/MainLayout';

import ProtectedRoute from './ProtectedRoute';
import AuthLogin from '@/features/auth/pages/AuthLogin';
import AuthRegister from '@/features/auth/pages/AuthRegister';
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
          {
            path: 'register',
            element: <AuthRegister />,
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
            element: <DashBoardPage />,
          },
          {
            path: 'profile',
            // element: <UserProfilePage />,
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
