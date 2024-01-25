import { CreateUserDTO, UserDTO, CredentialsDTO, TokensDTO } from '@kidsbe/dto';
import { getClient } from '@kidsbe/database';
import { verifyToken } from '@kidsbe/auth-utils';
import * as bcrypt from 'bcrypt';
import { SignJWT } from 'jose';
import { BadRequestError, UnauthorizedError } from '@kidsbe/http-errors';
import { toUserDTO } from '../utils';

export class LoginService {
  private createUserRequest = `INSERT INTO public.users(first_name, last_name, email, password)
     VALUES($1, $2, $3, $4) 
     RETURNING *;`;

  private findByEmailRequest = `SELECT id, email, password FROM public.users
    WHERE email = $1;`;

  private createTokenRequest = `INSERT INTO public.refresh_tokens(token, expires_at)
    VALUES($1, $2);`;

  private deleteTokenRequest = `DELETE FROM public.refresh_tokens
  WHERE token = $1`;

  async createUser(user: CreateUserDTO): Promise<UserDTO> {
    const saltRounds = process.env['SALT_ROUNDS']
      ? Number(process.env['SALT_ROUNDS'])
      : 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);

    const db = await getClient();
    try {
      const newUserResponse = await db.query(this.createUserRequest, [
        user.firstName,
        user.lastName,
        user.email,
        hashedPassword,
      ]);
      const userResponse = newUserResponse.rows[0];
      return toUserDTO(userResponse);
    } catch (error: any) {
      throw new BadRequestError(error);
    }
  }

  async login(creds: CredentialsDTO): Promise<TokensDTO> {
    const db = await getClient();
    const userResponse = await db.query(this.findByEmailRequest, [creds.email]);

    const credsResponse = userResponse.rows[0];
    if (!credsResponse) {
      throw new BadRequestError(`User not found`);
    }

    const passwordHash = credsResponse.password;
    const id = credsResponse.id;

    const hasAccess = await bcrypt.compare(creds.password, passwordHash);
    if (!hasAccess) {
      throw new BadRequestError('Password mismatch');
    }

    return await this.generateJWTPair(id);
  }

  async rotate(refreshToken: string): Promise<TokensDTO> {
    const payload = await verifyToken(refreshToken);
    if (!payload.isRefresh) {
      throw new UnauthorizedError(
        `User ${payload.userId} attempts rotate tokens with access token`
      );
    }

    const deleteResult = await this.deleteRefreshToken(refreshToken);
    if (!deleteResult.rowCount || deleteResult.rowCount < 1) {
      throw new UnauthorizedError(
        `User ${payload.userId} attempts use unreliable refresh token`
      );
    }

    const updatedTokens = await this.generateJWTPair(payload.userId);

    return updatedTokens;
  }

  private async saveRefreshToken(token: string, expires: Date) {
    const client = await getClient();
    const iso = expires.toISOString().replace('T', ' ').replace('Z', ''); // sounds of angry developer
    await client.query(this.createTokenRequest, [token, iso]);
  }

  private async deleteRefreshToken(token: string) {
    const client = await getClient();
    return await client.query(this.deleteTokenRequest, [token]);
  }

  private async generateJWTPair(userId: string): Promise<TokensDTO> {
    const role = process.env['ROLE'] as string;

    const accessPeriod = process.env['JWT_ACCESS_PERIOD']
      ? Number(process.env['JWT_ACCESS_PERIOD'])
      : 1000 * 60 * 2;
    const refreshPeriod = process.env['JWT_REFRESH_PERIOD']
      ? Number(process.env['JWT_REFRESH_PERIOD'])
      : 1000 * 60 * 60 * 24 * 7;

    const accessExp = new Date(Date.now() + accessPeriod);
    const refreshExp = new Date(Date.now() + refreshPeriod);

    const access = await this.generateJWT(false, userId, role, accessExp);
    const refresh = await this.generateJWT(true, userId, role, refreshExp);

    await this.saveRefreshToken(refresh, refreshExp);

    return { refresh, access };
  }

  private async generateJWT(
    isRefresh: boolean,
    userId: string,
    role: string,
    expiresAt: Date
  ): Promise<string> {
    const secret = new TextEncoder().encode(process.env['JWT_SECRET']);
    const alg = 'HS256';
    const token = new SignJWT({ userId, role, isRefresh })
      .setProtectedHeader({ alg })
      .setExpirationTime(expiresAt)
      .setIssuer(role);

    return await token.sign(secret);
  }
}
