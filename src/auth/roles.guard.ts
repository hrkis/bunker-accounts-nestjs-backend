import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { verify } from '../helper/jwtToken';
import { user_role } from '../enums/user';
import { UserService } from '../user.service';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: user_role[]) => SetMetadata(ROLES_KEY, roles);

export const authUser = { id: 0, roles: [] };

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(UserService) private readonly userService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<user_role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const user_token = request.headers.authorization;
    if (user_token) {
      let resp = false;
      await verify(user_token, async (err, decoded) => {
        if (decoded) {
          const user_id = decoded.id;
          const userRoles = [];
          authUser.id = user_id;

          await this.userService.getUserData(user_id).then((user_info) => {
            if (user_info) {
              Object.keys(user_info.user_company_role).forEach(function (key) {
                if (
                  userRoles.indexOf(user_info.user_company_role[key]['role']) <
                  0
                ) {
                  userRoles.push(user_info.user_company_role[key]['role']);
                }
              });
              authUser.roles = userRoles;
            }
          });

          if (!requiredRoles) {
            resp = true;
          } else {
            resp = requiredRoles.some((role) => userRoles?.includes(role));
          }
        }
      });
      return resp;
    }
    if (!requiredRoles) {
      return true;
    } else {
      return false;
    }
  }
}