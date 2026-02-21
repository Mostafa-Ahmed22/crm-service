import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { DefinitionsService } from './definitions.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { superAdminEnums } from 'src/common/enums/shared.enum';

import * as dtos from './dtos/index.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/user.decorator';

import { CurrentLanguage } from 'src/common/decorators/language.decorator';
import { CurrentPagination } from 'src/common/decorators/pagination.decorator';
import type * as interfaces from 'src/common/interfaces/index.interfaces';

@Controller('definitions')
export class DefinitionsController {
  constructor(
    private definitionsService: DefinitionsService
  ) { }

  @Roles(superAdminEnums.ROLE_EN_NAME)
  @Post("projects")
  async createProjects(@Body() body: dtos.CreateProjectDto) {
    return this.definitionsService.createProjects(body);
  }


  @Roles(superAdminEnums.ROLE_EN_NAME)
  @Post('countries')
  async createCountries(@CurrentUser() user: interfaces.User, @Body() body: dtos.CreateCountriesDto) {
    return this.definitionsService.createCountries(user, body);
  }

  @Roles(superAdminEnums.ROLE_EN_NAME)
  @Post("id-types")
  async createCustomerIDTypes(@CurrentUser() user: interfaces.User, @Body() body: dtos.CreateIDTypesDto) {
    return this.definitionsService.createCustomerIDTypes(user, body);
  }

  @Roles(superAdminEnums.ROLE_EN_NAME)
  @Post("religions")
  async createReligions(@CurrentUser() user: interfaces.User, @Body() body: dtos.CreateReligionsDto) {
    return this.definitionsService.createReligions(user, body);
  }

  @Roles(superAdminEnums.ROLE_EN_NAME)
  @Post("marital-statuses")
  async createMaritalStatuses(@CurrentUser() user: interfaces.User, @Body() body: dtos.CreateMaritalStatusesDto) {
    return this.definitionsService.createMaritalStatuses(user, body);
  }

  @Roles(superAdminEnums.ROLE_EN_NAME)
  @Post("customer-types")
  async createCustomerTypes(@CurrentUser() user: interfaces.User, @Body() body: dtos.CreateCustomerTypesDto) {
    return this.definitionsService.createCustomerTypes(user, body);
  }

  @Roles(superAdminEnums.ROLE_EN_NAME)
  @Post("menus")
  async createMenu(@Body() body: dtos.CreateMenuDto) {
    return this.definitionsService.createMenu(body);
  }

  @Roles(superAdminEnums.ROLE_EN_NAME)
  @Post("menuitems")
  async createMenuitems(@Body() body: dtos.CreateMenuitemsDto) {
    return this.definitionsService.createMenuitems(body);
  }

  @Roles(superAdminEnums.ROLE_EN_NAME)
  @Post("privileges")
  async createFeature(@Body() body: dtos.CreatePrivilegeDto) {
    return this.definitionsService.createPrivilege(body);
  }

  @Get("privileges")
  async getPrivilege(@CurrentLanguage() lang:string, @Query("privilege_name") filter: string) {
    return this.definitionsService.getPrivileges(lang, filter);
  }

  @Roles(superAdminEnums.ROLE_EN_NAME)
  @Post("assign-privilege-to-menuitems")
  async assignPrivilegeToMenuitems(@Body() data: { privileges: { menuitem_id: number, privilege_id: number, status: number }[] }) {
    return this.definitionsService.assignPrivilegeToMenuitems(data);
  }

  @Post("department")
  async createDepartment(@CurrentUser() user: interfaces.User, @Body() body: dtos.CreateDepartmentDto) {
    return this.definitionsService.createDepartment(user, body);
  }

  @Post("safes")
  async createSafe(@CurrentUser() user: interfaces.User, @Body() body: dtos.CreateSafeDto) {
    return this.definitionsService.createSafe(user, body);
  }

  @Post("employee-types")
  async createEmployeeTypes(@CurrentUser() user: interfaces.User, @Body() body: dtos.CreateEmployeeTypesDto) {
    return this.definitionsService.createEmployeeTypes(user, body);
  }

  @Post("positions")
  async createPositions(@CurrentUser() user: interfaces.User, @Body() body: dtos.CreatePositionsDto) {
    return this.definitionsService.createPositions(user, body);
  }
  @Post("service-config")
  async createServiceConfig(@CurrentUser() user: interfaces.User, @Body() body: dtos.CreateServiceConfigDto) {
    return this.definitionsService.createServiceConfig(user, body);
  }

  @Get("service-configs")
  async getServiceConfigs(@CurrentUser() user: interfaces.User, @CurrentLanguage() lang: string) {
    return this.definitionsService.getServiceConfigs(user, lang);
  }

  @Post("service")
  async createService(@CurrentUser() user: interfaces.User, @Body() body: dtos.CreateServiceDto) {
    return this.definitionsService.createService(user, body);
  }

  @Get("services")
  async getServices(@CurrentUser() user: interfaces.User, @CurrentPagination() pagination: interfaces.Pagination,
  @CurrentLanguage() lang: string, @Query() filter: dtos.ServiceSearchDto) {
    return this.definitionsService.getServices(user, pagination, lang, filter);
  }

  @Get("all-dropdowns")
  async getAllDropDowns(@CurrentUser() user: interfaces.User, @CurrentLanguage() lang: string) {
    return this.definitionsService.getAllDropDowns(user, lang);
  }

  @Post("location-types")
  async createLocationType(@CurrentUser() user: interfaces.User, @Body() body: dtos.CreateLocationTypesDto) {
    return this.definitionsService.createLocationType(user, body);
  }

  @Post("locations")
  async createLocation(@CurrentUser() user: interfaces.User, @Body() body: dtos.CreateLocationsDto) {
    return this.definitionsService.createLocation(user, body);
  }

  @Post("rental-companies")
  async createRentalCompany(@CurrentUser() user: interfaces.User, @Body() body: dtos.CreateRentalCompaniesDto) {
    return this.definitionsService.createRentalCompany(user, body);
  }

  @Post("unit-types")
  async createUnitType(@CurrentUser() user: interfaces.User, @Body() body: dtos.CreateUnitTypesDto) {
    return this.definitionsService.createUnitType(user, body);
  }

}
