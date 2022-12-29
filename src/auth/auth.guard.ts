import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { verify } from '../helper/jwtToken';
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user_token = request.headers.authorization;

    if (user_token) {
      let resp = false;
      verify(user_token, async (err, decoded) => {
        if (decoded) {
          resp = true;
        }
      });
      return resp;
    } else {
      return false;
    }
  }
}
