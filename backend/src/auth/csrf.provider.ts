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
      // Ties the CSRF token to the caller's refresh-token session — there is no
      // server-side session store since auth is JWT-based.
      getSessionIdentifier: (req: Request) => req.cookies?.['refresh_token'] ?? 'anonymous',
      cookieName: 'csrf_token',
      cookieOptions: { httpOnly: false, sameSite: 'strict', secure: true, path: '/api' },
      getCsrfTokenFromRequest: (req: Request) => req.headers['x-csrf-token'],
    }),
};
