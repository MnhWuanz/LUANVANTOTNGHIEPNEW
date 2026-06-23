declare global {
  namespace Express {
    interface User {
      id_username: string;
      email: string;
      role: string;
    }
  }
}
