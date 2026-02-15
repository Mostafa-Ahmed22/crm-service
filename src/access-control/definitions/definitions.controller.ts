import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { DefinitionsService } from './definitions.service';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateMenuDto } from './dtos/create-menu.dto';
import { CreatePrivilegeDto } from './dtos/create-privileges.dto';
import { CreateMenuItemsDto } from './dtos/create-menuItems.dto';
import { CreateDepartmentDto } from './dtos/create-department.dto';
import { superAdminEnums } from 'src/common/enums/shared.enum';
import { CreateServiceConfigDto } from './dtos/create-service-config.dto';
import { CreateServiceDto } from './dtos/create-service.dto';

@Controller('definitions')
export class ModulesController {
  constructor(
    private definitionsService: DefinitionsService
  ) { }

  @Roles(superAdminEnums.ROLE_EN_NAME)
  @Post("create-menu")
  async createMenu(@Body() body: CreateMenuDto) {
    return this.definitionsService.createMenu(body);
  }

  @Roles(superAdminEnums.ROLE_EN_NAME)
  @Post("create-menuItems")
  async createModule(@Body() body: CreateMenuItemsDto) {
    return this.definitionsService.createMenuItems(body);
  }

  @Roles(superAdminEnums.ROLE_EN_NAME)
  @Post("create-privilege")
  async createFeature(@Body() body: CreatePrivilegeDto) {
    return this.definitionsService.createPrivilege(body);
  }


  @Get("get-privileges")
  async getPrivilege(@Req() req, @Query("privilegeName") filter: string) {
    return this.definitionsService.getPrivileges(req.lang, filter);
  }

  @Roles(superAdminEnums.ROLE_EN_NAME)
  @Post("assign-privilege-to-menuItem")
  async assignPrivilegeToMenuItems(@Body() data: { privileges: { menuItem_id: number, privilege_id: number, status: number }[] }) {
    return this.definitionsService.assignPrivilegeToMenuItems(data);
  }

  @Post("department")
  async createDepartment(@Req() req, @Body() body: CreateDepartmentDto) {
    return this.definitionsService.createDepartment(body, req.user);
  }

  @Post("service-config")
  async createServiceConfig(@Req() req, @Body() body: CreateServiceConfigDto) {
    return this.definitionsService.createServiceConfig(req.user, body);
  }

  @Get("service-configs")
  async getServiceConfigs(@Req() req) {
    return this.definitionsService.getServiceConfigs(req.lang, req.user);
  }

  @Post("service")
  async createService(@Req() req, @Body() body: CreateServiceDto) {
    return this.definitionsService.createService(req.user, body);
  }

  @Get("services")
  async getServices(@Req() req) {
    return this.definitionsService.getServices(req.user, req.pagination, req.lang);
  }

}
