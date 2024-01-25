import { Request, Response, NextFunction } from 'express';
import { Unauthorized } from 'http-errors';
import * as jose from 'jose';
import { KidsbeAuthLocals, KidsbeJWTPayload } from './types';

declare module 'express' {
  interface Response {
    locals: KidsbeAuthLocals;
  }
}

export async function verifyToken(token: string): Promise<KidsbeJWTPayload> {
  const secret = new TextEncoder().encode(process.env['JWT_SECRET'] || '');
  const verifyResult = await jose.jwtVerify<KidsbeJWTPayload>(token, secret);
  return verifyResult.payload;
}

export async function authorizedMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.header('Authorization');
    if (!token) {
      throw new Unauthorized('Token not provided');
    }

    const payload = await verifyToken(token);

    if (payload['isRefresh']) {
      // TODO: possible the token has been compromised.
      // Needs implement blacklisting of compromised tokens
      throw new Unauthorized(
        'Refresh token should not be used for authorization'
      );
    }

    res.locals.userId = payload.userId;
    res.locals.isAdmin = payload.role === 'ADMIN';
    res.locals.isUser = payload.role === 'USER';
    next();
  } catch (error: any) {
    next(error);
  }
}
