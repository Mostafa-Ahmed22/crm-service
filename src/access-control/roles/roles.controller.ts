import { Body, Controller, Get, Param, Post, Req, Query } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dtos/create-role.dto';

@Controller('roles')
export class RolesController {
  constructor ( private rolesService: RolesService ) {}

  @Post()
  async createRole(@Req() req, @Body() body: CreateRoleDto) {
    return this.rolesService.createRole(body, req.user);
  }

  @Get()
  async getRoles(@Req() req, @Query("roleName") filter: string) {
    return this.rolesService.getRoles(req.lang, req.user, req.pagination, filter);
  }

  @Post("assign-privilege-to-role")
  async assignPrivilegeToRole(@Body() data: { privileges: { role_id: string, menuItem_id: number, privilege_id: number, status: number }[] }) {
    return this.rolesService.assignPrivilegeToRole(data);
  }

  @Get("get-role-privileges")
  async getRolePrivileges(@Req() req, @Query("role_id") filter: string) {
    const role_id = filter? filter : req.user.role_id;
    return this.rolesService.getRolePrivileges(role_id, req.lang);
  }


  
}
