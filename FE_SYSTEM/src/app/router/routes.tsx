import { createBrowserRouter } from 'react-router-dom';


import AuthLayout from '../layouts/AuthLayout';

import MainLayout from '@/app/layouts/MainLayout';

import ProtectedRoute from './ProtectedRoute';
import AuthLogin from '@/features/auth/pages/AuthLogin';

import UserProfilePage from '@/features/users/pages/UserProfilePage';



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
            // element: <DashBoardPage />,
            element: <h1>Dashboard</h1>
          },
          {
            path: 'profile',
            element: <UserProfilePage />,
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
