/* eslint-disable @typescript-eslint/no-explicit-any */
import { HTTP_STATUS } from "@/shared/types/http-status";
import axios from "axios";


export const axiosCilent=axios.create({
    baseURL:import.meta.env.VITE_API_URL,
    headers:{
        "Content-Type":"application/json"
    }
})
axiosCilent.interceptors.request.use((config)=>{
    const token=localStorage.getItem("accessToken")
    if(token){
        config.headers.Authorization=`Bearer ${token}`
    }
    return config
})

let isRefreshing=false;
let failedQueue:{ resolve: (token: string) => void;
  reject: (error: any) => void;}[]=[];
const processQueue = (error: any, token?: string) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
};
axiosCilent.interceptors.response.use((response)=>{
    return response
}, async (error)=>{
    const originalRequest=error.config;
    if(error.response?.status===HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry){
        if(isRefreshing){
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve:(token:string)=>{
                        originalRequest.headers.Authorization=`Bearer ${token}`;
                        resolve(axiosCilent(originalRequest));
                    },
                    reject
                })
            })
        }
        originalRequest._retry = true;
        isRefreshing=true;
        try {
            const refreshToken=localStorage.getItem('refreshToken');
            if(!refreshToken){
                throw new Error("Refresh token not found")
            }
            const res=await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh-token`,{
                refreshToken
            })
            const {accessToken,refreshToken:newRefreshToken}=res.data.data;
            localStorage.setItem("accessToken",accessToken);
            localStorage.setItem("refreshToken",newRefreshToken);
            processQueue(null, accessToken);
            originalRequest.headers.Authorization=`Bearer ${accessToken}`;
            return axiosCilent(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href="/auth/login";
            throw Promise.reject(refreshError);
        }finally{
            isRefreshing=false;
        }

    }
})