import { JWTPayload } from 'jose';

export interface KidsbeAuthLocals {
  userId: string;
  isAdmin: boolean;
  isUser: boolean;
}

export interface KidsbeJWTPayload extends JWTPayload {
  userId: string;
  role: 'USER' | 'ADMIN';
  isRefresh: boolean;
}
