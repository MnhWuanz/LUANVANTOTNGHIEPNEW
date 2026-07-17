import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

function getHeaderValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function isSameSecret(input: string, expected: string) {
  const inputBuffer = Buffer.from(input);
  const expectedBuffer = Buffer.from(expected);

  return (
    inputBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(inputBuffer, expectedBuffer)
  );
}

export const verifyStudentPortalApiKey = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const apiKey = getHeaderValue(req.headers['x-api-key'])?.trim();

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'Missing x-api-key',
    });
  }

  const configuredApiKey = process.env.STUDENT_PORTAL_API_KEY?.trim();

  if (!configuredApiKey) {
    return res.status(500).json({
      success: false,
      message: 'STUDENT_PORTAL_API_KEY is not configured',
    });
  }

  if (!isSameSecret(apiKey, configuredApiKey)) {
    return res.status(403).json({
      success: false,
      message: 'Invalid x-api-key',
    });
  }
  next();
};
