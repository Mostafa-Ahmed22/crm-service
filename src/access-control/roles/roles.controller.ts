import { Body, Controller, Get, Param, Post, Req, Query } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Roles } from 'src/decorators/roles.decorator';
import { adminsEnums } from 'src/auth/enums/auth.enum';
import { CreateRoleDto } from './dtos/create-role.dto';

@Controller('roles')
export class RolesController {
  constructor ( private rolesService: RolesService ) {}

  // @Roles(adminsEnums.en.SUPER_ADMIN, adminsEnums.en.SITE_ADMIN)
  @Post("create")
  async createRole(@Req() req, @Body() body: CreateRoleDto) {
    return this.rolesService.createRole(body, req.user);
  }

  @Get("get")
  async getRoles(@Req() req, @Query("roleName") filter: string) {
    return this.rolesService.getRoles(req.lang, req.user,filter);
  }

  @Roles(adminsEnums.en.SUPER_ADMIN, adminsEnums.en.SITE_ADMIN)
  @Post("assign-features-to-role")
  async assignModulesToRole(@Body() data: { features: { role_id: string, module_id: number, feature_id: number, status: number }[] }) {
    return this.rolesService.assignFeatureToRole(data);
  }

  @Get("get-role-features/:role_id")
  async getRoleFeatures(@Req() req, @Param() data: { role_id: string; }) {
    return this.rolesService.getRoleFeatures(data.role_id, req.lang);
  }


  
}
