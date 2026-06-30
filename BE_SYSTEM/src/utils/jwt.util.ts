import jwt, { Secret, SignOptions } from 'jsonwebtoken';

type JwtUserPayload = {
  id_user: number;
  email: string;
  role: string;
};

const getJwtSecret = (envName: 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET') => {
  const secret = process.env[envName];
  if (!secret) {
    throw new Error(`${envName} is not configured`);
  }

  return secret as Secret;
};

const ACCESS_TOKEN_EXPIRES_IN = (process.env.JWT_ACCESS_EXPIRES ||
  '15m') as SignOptions['expiresIn'];

export function signAccessToken(user: JwtUserPayload) {
  return jwt.sign(
    {
      id_user: user.id_user,
      email: user.email,
      role: user.role,
    },
    getJwtSecret('JWT_ACCESS_SECRET'),
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    },
  );
}

const REFRESH_TOKEN_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES ||
  '7d') as SignOptions['expiresIn'];

export function signRefreshToken(user: JwtUserPayload) {
  return jwt.sign(
    {
      id_user: user.id_user,
    },
    getJwtSecret('JWT_REFRESH_SECRET'),
    {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    },
  );
}

export function verifyAccessToken(token: string): JwtUserPayload {
  return jwt.verify(token, getJwtSecret('JWT_ACCESS_SECRET')) as JwtUserPayload;
}

export function verifyRefreshToken(token: string): { id_user: number } {
  return jwt.verify(token, getJwtSecret('JWT_REFRESH_SECRET')) as {
    id_user: number;
  };
}
