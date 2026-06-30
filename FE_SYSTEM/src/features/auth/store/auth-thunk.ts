import { getMe, login, logout } from "@/features/auth/api/auth-api";
import type { LoginPayload  } from "@/features/auth/types/auth-type";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const loginThunk=createAsyncThunk("auth/login",async(payload:LoginPayload,thunkAPI)=>{
    try {
        const res=await login(payload);
        return res.data.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error:any) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Đăng nhập thất bại');
    }
})
export const getMeThunk=createAsyncThunk("auth/getMe",async (_,thunkAPI)=>{
    try {
        const res= await getMe();
        return res.data.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error:any) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Lấy thông tin thất bại');
    }   
})

export const logoutThunk=createAsyncThunk("auth/logout",async(_,thunkAPI)=>{
    try {
        const res=await logout();
        localStorage.removeItem("accessToken");
        return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error:any) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Đăng xuất thất bại');
    }
})