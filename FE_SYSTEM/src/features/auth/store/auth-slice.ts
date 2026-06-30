import { getMeThunk, loginThunk, logoutThunk } from '@/features/auth/store/auth-thunk';
import type { User } from '@/features/users/types/user-type';
import { createSlice } from '@reduxjs/toolkit'
export interface AuthState {
  user: User | null;
  loading: boolean;
  initialized:boolean;
  error: string | null;
}
const initialState: AuthState = {
    user: null,
    loading: false,
    initialized:false,
    error: null,
}
export const authSlice=createSlice({
    name:"auth",
    initialState,
    reducers:{
        logout:(state)=>{
            state.user=null;
            localStorage.removeItem("accessToken");
        },
         markInitialized: (state) => {
      state.initialized = true;
    },
    },
    extraReducers:(builder)=>{
        builder
        .addCase(loginThunk.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(loginThunk.fulfilled,(state,action)=>{
            state.loading=false;
            state.user=action.payload.user;
            state.initialized=true;
            localStorage.setItem("accessToken",action.payload.accessToken);
        })
        .addCase(loginThunk.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload as string;
        })
        .addCase(getMeThunk.pending,(state)=>{
             state.loading=true;
            state.error=null;
        })
        .addCase(getMeThunk.fulfilled,(state,action)=>{
            state.loading=false;

            state.user=action.payload;
            state.initialized=true;
        })
        .addCase(getMeThunk.rejected,(state,action)=>{
            state.user=null;
            state.loading=false;
            state.error=action.payload as string;
            state.initialized=true;
        })
        .addCase(logoutThunk.fulfilled,(state)=>{
            state.user=null;
            state.error=null;
        })
        .addCase(logoutThunk.rejected,(state,action)=>{
            state.user=null;
            state.error=action.payload as string;
        })
        
    }
})
export const { logout, markInitialized } = authSlice.actions;

export default authSlice.reducer;

