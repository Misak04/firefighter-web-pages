import { CanActivate, ExecutionContext, Inject, Injectable, ForbiddenException } from '@nestjs/common';
import { CSRF_UTILS, CsrfUtils } from '../csrf.provider';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(@Inject(CSRF_UTILS) private readonly csrf: CsrfUtils) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    let error: unknown;
    this.csrf.doubleCsrfProtection(req, res, (err?: unknown) => {
      error = err;
    });

    if (error) {
      throw new ForbiddenException('Invalid or missing CSRF token');
    }
    return true;
  }
}
