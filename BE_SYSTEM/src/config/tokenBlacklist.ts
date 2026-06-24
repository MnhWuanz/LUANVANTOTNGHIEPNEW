import jwt from 'jsonwebtoken';
import 'dotenv/config';

// Lưu token đã bị thu hồi: token -> thời điểm hết hạn (ms)
const blacklist = new Map<string, number>();

const addToBlacklist = (token: string): void => {
  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    const expMs = decoded?.exp
      ? decoded.exp * 1000
      : Date.now() + 60 * 60 * 1000;
    blacklist.set(token, expMs);
  } catch {
    blacklist.set(token, Date.now() + 60 * 60 * 1000);
  }
};

// Kiểm tra token có trong blacklist không
const isBlacklisted = (token: string): boolean => {
  const exp = blacklist.get(token);
  if (!exp) return false;

  // Nếu token đã hết hạn tự nhiên → xóa khỏi blacklist luôn
  if (Date.now() > exp) {
    blacklist.delete(token);
    return false;
  }
  return true;
};

// Dọn dẹp các token đã hết hạn (chạy định kỳ mỗi 15 phút)
setInterval(
  () => {
    const now = Date.now();
    for (const [token, exp] of blacklist.entries()) {
      if (now > exp) blacklist.delete(token);
    }
  },
  15 * 60 * 1000,
);

export const tokenBlacklist = { addToBlacklist, isBlacklisted };
