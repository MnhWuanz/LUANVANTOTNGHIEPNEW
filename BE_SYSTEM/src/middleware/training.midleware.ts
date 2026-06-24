import { NextFunction, Request, Response } from 'express';

export const verifyTrainingApiKey = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const api_key = req.headers['x-api-key'] as string;
  if (!api_key) {
    return res
      .status(401)
      .json({ success: false, message: 'Không có API key' });
  }
  if (api_key !== process.env.TRAINING_API_KEY) {
    return res
      .status(403)
      .json({ success: false, message: 'API key không hợp lệ' });
  }
  next();
};
