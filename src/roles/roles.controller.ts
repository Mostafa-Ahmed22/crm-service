import { Body, Controller, Get, Param, Post, Req, Query } from '@nestjs/common';
import { RolesService } from './roles.service';

import type * as interfaces from 'src/common/interfaces/index.interfaces';
import * as dtos from "./dtos/index.dtos";
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { CurrentLanguage } from 'src/common/decorators/language.decorator';
import { CurrentPagination } from 'src/common/decorators/pagination.decorator';

@Controller('roles')
export class RolesController {
  constructor ( private rolesService: RolesService ) {}

  @Post()
  async createRole(@CurrentUser() user: interfaces.User, @Body() body: dtos.CreateRoleDto) {
    return this.rolesService.createRole(user, body);
  }

  @Get()
  async getRoles(@CurrentUser() user: interfaces.User, @CurrentLanguage() lang:string,
    @CurrentPagination() pagination: interfaces.Pagination, @Query() filter: dtos.SearchRoleDto) {
    return this.rolesService.getRoles(lang, user, pagination, filter);
  }

  @Post("update/:id")
  async updateRole(@CurrentUser() user: interfaces.User, @Param() params: dtos.UpdateRoleParamsDto, @Body() body: dtos.UpdateRoleDto) {
    return this.rolesService.updateRole(user, params, body);
  }

  @Post("assign-privilege-to-role")
  async assignPrivilegeToRole(@Body() data: dtos.CreateRolePrivilegesDto) {
    return this.rolesService.assignPrivilegeToRole(data);
  }

  @Get("get-role-privileges")
  async getRolePrivileges(@CurrentUser() user: interfaces.User, @CurrentLanguage() lang: string, @Query() filter: dtos.SearchRoleDto) {
    const role_id = filter.role_id? filter.role_id : user.role_id;
    return this.rolesService.getRolePrivileges(lang, role_id);
  }

}
