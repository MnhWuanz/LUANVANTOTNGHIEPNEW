import type { LoginPayload, RegisterPayload } from "@/features/auth/types/auth-type";
import { axiosCilent } from "@/shared/lib/axios";

export const login = async (payload: LoginPayload) => {
  try {
    const response = await axiosCilent.post("/auth/login", payload); 
    return response;
    } catch (error) {   
    console.error("Login error:", error);
    throw error;
  }
};
export const getMe=()=>{
    return axiosCilent.get("/users/me")
}
export const register = (payload: Omit<RegisterPayload, 'repassword'>) => {
  try {    
    const response = axiosCilent.post("/auth/register", payload); 
    return response;
    } catch (error) {   
      console.error("Register error:", error);
    throw error;
  }
}