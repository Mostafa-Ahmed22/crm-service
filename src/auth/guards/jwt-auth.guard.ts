import { Injectable, ExecutionContext, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../../common/decorators/public.decorator";
import { PrismaService } from "src/prisma/prisma.service";
import { isDeleteStatusEnums } from "src/common/enums/shared.enum";
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(
    private reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    // ✅ Allow public endpoints without token
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const can = await super.canActivate(context) as boolean;
    if (!can) return false;

    // Now, check the employee and role status (user is attached at this point)
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (user) {
      const employee = await this.prisma.employees.findUnique({
        where: { id: user.employee_id },
      include: { roles_employees_role_idToroles: true },
    });

      if (!employee) {
        throw new UnauthorizedException("Invalid authentication signature");
      }
      if (employee.is_deleted === isDeleteStatusEnums.DELETED) {
        throw new BadRequestException('Your account has been deleted, please contact administrator');
      }
      if (employee.is_locked === isDeleteStatusEnums.DELETED) {
        throw new BadRequestException('Your account has been locked, please contact administrator');
      }
      if (employee.roles_employees_role_idToroles?.is_deleted === isDeleteStatusEnums.DELETED) {
        throw new BadRequestException('Your role has been deleted, please contact administrator');
      }
    }

    return true;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException("Invalid or missing authentication token");
    }
    return user; // attaches decoded payload to request.user
  }
}