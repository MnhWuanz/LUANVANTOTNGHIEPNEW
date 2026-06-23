/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import authAPI from '../../services/authServiceAPI';
import type { LoginRequest, User } from '../../services/authServiceAPI';
import { setAccessToken } from '../../services/axiosClient';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

// Async Thunk xử lý đăng nhập
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      const { user, accessToken } = response.data.data;
      // Lưu token vào bộ nhớ tạm của axiosClient
      setAccessToken(accessToken);
      return user;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      return rejectWithValue(message);
    }
  },
);

// Async Thunk xử lý làm mới phiên đăng nhập (khi tải lại trang)
export const refreshUser = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.refresh();
      const { user, accessToken } = response.data.data;
      // Lưu token mới
      setAccessToken(accessToken);
      return user;
    } catch (error: any) {
      // Khi refresh lỗi (chưa đăng nhập hoặc cookie hết hạn), xóa token cũ
      setAccessToken(null);
      return rejectWithValue(
        error.response?.data?.message || 'Phiên làm việc hết hạn',
      );
    }
  },
);

// Async Thunk xử lý đăng xuất
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
    } catch (error: any) {
      // Bỏ qua lỗi logout từ server để chắc chắn client vẫn xóa thông tin đăng nhập
      return rejectWithValue(
        error.response?.data?.message || 'Đăng xuất thất bại',
      );
    } finally {
      // Xóa accessToken khỏi client
      setAccessToken(null);
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 1. Đăng nhập (loginUser)
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 2. Làm mới phiên (refreshUser)
    builder
      .addCase(refreshUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(refreshUser.rejected, (state) => {
        state.loading = false;
        state.user = null; // Huỷ phiên đăng nhập
      });

    // 3. Đăng xuất (logoutUser)
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.error = null;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
