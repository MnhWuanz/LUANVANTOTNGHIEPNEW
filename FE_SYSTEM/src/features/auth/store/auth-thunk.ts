import { getMe, login, register } from "@/features/auth/api/auth-api";
import type { LoginPayload, RegisterPayload } from "@/features/auth/types/auth-type";
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
export const registerThunk=createAsyncThunk("auth/register",async(payload:RegisterPayload,thunkAPI)=>{
    try {
        const res=await register(payload);
        return res.data.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error:any) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Đăng ký thất bại');
    }
})