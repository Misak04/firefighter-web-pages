import { ConfigService } from '@nestjs/config';
import { doubleCsrf } from 'csrf-csrf';
import type { Request } from 'express';

export const CSRF_UTILS = 'CSRF_UTILS';

export type CsrfUtils = ReturnType<typeof doubleCsrf>;

export const csrfUtilsProvider = {
  provide: CSRF_UTILS,
  inject: [ConfigService],
  useFactory: (config: ConfigService): CsrfUtils =>
    doubleCsrf({
      getSecret: () => config.get<string>('CSRF_SECRET')!,
      // No server-side session store (auth is stateless JWT), so there's no stable
      // per-session value available at both token-generation and validation time —
      // e.g. the refresh_token cookie set via res.cookie() during login isn't yet
      // present on req.cookies for that same request. A constant identifier still
      // provides the core double-submit guarantee: an attacker's cross-site page
      // cannot read the csrf_token cookie to forge a matching X-CSRF-Token header.
      getSessionIdentifier: () => 'global',
      cookieName: 'csrf_token',
      cookieOptions: { httpOnly: false, sameSite: 'strict', secure: true, path: '/api' },
      getCsrfTokenFromRequest: (req: Request) => req.headers['x-csrf-token'],
    }),
};
