import { useEffect } from 'react';
import {  useAppDispatch } from '@/app/redux/hooks';
import { getMeThunk } from '@/features/auth/store/auth-thunk';

export default function AppInit({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const token=localStorage.getItem("accessToken");
    if (token) {
      dispatch(getMeThunk());
    }
  }, [ dispatch]);
  return children;
}
