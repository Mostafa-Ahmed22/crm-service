import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { Roles } from 'src/decorators/roles.decorator';
import { adminsEnums } from 'src/auth/enums/auth.enum';
import { CreateMenuDto } from './dtos/create-menu.dto';
import { CreateFeatureDto } from './dtos/create-features.dto';
import { CreateModulesDto } from './dtos/create-modules.dto';

@Controller('modules')
export class ModulesController {
  constructor(
    private modulesService: ModulesService
  ) {}

  @Roles(adminsEnums.en.SUPER_ADMIN)
  @Post("create-menu")
  async createMenu(@Body() body: CreateMenuDto) {
    return this.modulesService.createMenu(body);
  }

  @Roles(adminsEnums.en.SUPER_ADMIN)
  @Post("create-modules")
  async createModule(@Body() body: CreateModulesDto) {
    return this.modulesService.createModule(body);
  }

  @Roles(adminsEnums.en.SUPER_ADMIN)
  @Post("create-feature")
  async createFeature(@Body() body: CreateFeatureDto) {
    return this.modulesService.createFeature(body);
  }

  @Get("get-features")
  async getFeatures(@Req() req, @Query("moduleName") filter: string) {
    return this.modulesService.getFeatures(req.lang, filter);
  }

  @Roles(adminsEnums.en.SUPER_ADMIN, adminsEnums.en.SITE_ADMIN)
  @Post("assign-features-to-module")
  async assignFeaturesToModule(@Body() data: { features: { role_id: string, module_id: number, feature_id: number, status: number }[] }) {
    return this.modulesService.assignFeaturesToModule(data);
  }


  
}
