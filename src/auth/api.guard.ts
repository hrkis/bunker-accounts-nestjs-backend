import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ApiGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const api_key = request.headers['api-key'];
    const api_version = request.headers['api-version'];

    if (
      api_key == process.env.API_KEY &&
      api_version == process.env.API_VERSION
    ) {
      return true;
    } else {
      return false;
    }
  }
}
