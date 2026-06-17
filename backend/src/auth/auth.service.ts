import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { AccessTokenPayload, RefreshTokenPayload } from './auth.types';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string, ip: string | undefined): Promise<TokenPair> {
    if (await this.redis.isLockedOut(email)) {
      await this.audit(null, 'auth.login', false, ip);
      throw new UnauthorizedException('Account temporarily locked due to repeated failed attempts');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!user || !valid) {
      await this.redis.recordLoginFailure(email);
      await this.audit(user?.id ?? null, 'auth.login', false, ip);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.redis.clearLoginFailures(email);
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
    await this.audit(user.id, 'auth.login', true, ip);

    return this.issueTokenPair(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string, ip: string | undefined): Promise<TokenPair> {
    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const valid = await this.redis.isRefreshTokenValid(payload.sub, payload.jti);
    if (!valid) {
      throw new UnauthorizedException('Refresh token revoked or expired');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.redis.revokeRefreshToken(payload.sub, payload.jti);
    await this.audit(user.id, 'auth.refresh', true, ip);

    return this.issueTokenPair(user.id, user.email, user.role);
  }

  async logout(refreshToken: string, ip: string | undefined): Promise<void> {
    try {
      const payload = await this.jwt.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
      await this.redis.revokeRefreshToken(payload.sub, payload.jti);
      await this.audit(payload.sub, 'auth.logout', true, ip);
    } catch {
      // already invalid/expired — nothing to revoke
    }
  }

  private async issueTokenPair(userId: string, email: string, role: string): Promise<TokenPair> {
    const accessPayload: AccessTokenPayload = { sub: userId, email, role: role as never };
    const accessToken = await this.jwt.signAsync(accessPayload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });

    const jti = randomUUID();
    const refreshPayload: RefreshTokenPayload = { sub: userId, jti };
    const refreshToken = await this.jwt.signAsync(refreshPayload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });
    await this.redis.storeRefreshToken(userId, jti);

    return { accessToken, refreshToken };
  }

  private async audit(userId: string | null, action: string, success: boolean, ip: string | undefined) {
    await this.prisma.auditLog.create({
      data: { userId, action, success, ip },
    });
  }
}
