import { getMeThunk, loginThunk, registerThunk } from '@/features/auth/store/auth-thunk';
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
            localStorage.removeItem("refreshToken");
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
            localStorage.setItem("accessToken",action.payload.accessToken);
            localStorage.setItem("refreshToken",action.payload.refreshToken);
        })
        .addCase(loginThunk.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload as string;
        })
        .addCase(registerThunk.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(registerThunk.fulfilled,(state,action)=>{
            state.loading=false;
            state.user=action.payload.user;
            localStorage.setItem("accessToken",action.payload.accessToken);
            localStorage.setItem("refreshToken",action.payload.refreshToken);
        })
        .addCase(registerThunk.rejected,(state,action)=>{
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
        
    }
})
export const { logout, markInitialized } = authSlice.actions;

export default authSlice.reducer;
