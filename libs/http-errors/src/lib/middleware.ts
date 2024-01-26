import { NextFunction, Request, Response } from 'express';
import { HttpError } from './errors';

export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof HttpError) {
    const httpError = error as HttpError;
    console.log(httpError.format());
    res.status(httpError.code).json({success: false});
  } else {
    console.warn(error);
    res.status(500).json({success: false});
  }
  next(error);
}
