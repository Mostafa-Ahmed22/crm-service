import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { superAdminEnums } from 'src/common/enums/shared.enum';

import * as dtos from './dtos/index.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/user.decorator';

import { CurrentLanguage } from 'src/common/decorators/language.decorator';
import { CurrentPagination } from 'src/common/decorators/pagination.decorator';
import type * as interfaces from 'src/common/interfaces/index.interfaces';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(
    private projectsService: ProjectsService
  ) { }

  @Post("unit")
  async createUnit(@CurrentUser() user: interfaces.User, @Body() body: dtos.CreateUnitDto) {
    return this.projectsService.createUnit(user, body);
  }

  @Get("units")
  async getUnits(@CurrentUser() user: interfaces.User, @CurrentPagination() pagination: interfaces.Pagination,
    @CurrentLanguage() lang: string, @Query() getUnitsDto: dtos.GetUnitsDto) {
    return this.projectsService.getUnits(user, pagination, lang, getUnitsDto);
  }

  @Public()
  @Get("/:project_id/units/:unit_number")
  async getProjectUnit(@CurrentLanguage() lang: string, @Param("project_id") projectId: number, @Param("unit_number") unitNumber: string) {
    await this.projectsService.checkIfProjectInPublic(projectId);
    return this.projectsService.getProjectUnit(projectId, lang, unitNumber);
  }

  @Public()
  @Get()
  async getProjects(@CurrentLanguage() lang: string) {
    return this.projectsService.getProjects(lang);
  }

  @Public()
  @Get(':project_id')
  async getCompanyCodes(@CurrentLanguage() lang: string, @Param('project_id') projectId: number) {
    await this.projectsService.checkIfProjectInPublic(projectId);
    return this.projectsService.getCompanyCodes(lang, projectId);
  }

}
