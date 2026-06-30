import type { LoginPayload } from "@/features/auth/types/auth-type";
import { axiosCilent } from "@/shared/lib/axios";

export const login = async (payload: LoginPayload) => {
  try {
    const response = await axiosCilent.post("/auth/login", payload); 
    return response;
    } catch (error) {   
    throw error;
  }
};
export const getMe=()=>{
    return axiosCilent.get("/auth/me")
}
export const logout=()=>{
    return axiosCilent.post("/auth/logout")
}
