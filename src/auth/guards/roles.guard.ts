// src/auth/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../../decorators/public.decorator";
import { ROLES_KEY } from "../../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true; // ✅ allow public endpoints

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // ✅ if not public and no token → throw Unauthorized
    if (!user) {
      throw new UnauthorizedException("No authentication token provided");
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // ✅ if no specific roles required, just allow authenticated user
    if (!requiredRoles) return true;

    if (!requiredRoles.includes(user.role_name)) {
      throw new ForbiddenException("Insufficient role permissions");
    }

    return true;
  }
}