import { NextFunction } from 'express';

export function exceptionWrapper(
  next: NextFunction,
  callback: () => Promise<void>
) {
  callback()
    .then(() => {})
    .catch((e: any) => next(e));
}
