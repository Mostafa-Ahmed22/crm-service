import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dtos/create-employee.dto';
import { UpdateEmployeeDto } from './dtos/update-employee.dto';

import type * as interfaces from 'src/common/interfaces/index.interfaces';
import * as dtos from "./dtos/index.dtos";
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { CurrentLanguage } from 'src/common/decorators/language.decorator';
import { CurrentPagination } from 'src/common/decorators/pagination.decorator';

@Controller('employees')
export class EmployeesController {
  constructor(private employeesService: EmployeesService) { }
  
  @Post()
  async createEmployee(@Body() body: dtos.CreateEmployeeDto) {
    return this.employeesService.createEmployee(body);
  }

  @Get() 
  async getAllEmployees(@CurrentUser() user: interfaces.User, @CurrentLanguage() lang: string, @CurrentPagination() pagination: interfaces.Pagination, @Query('name') filter: string) {
    return this.employeesService.getAllEmployees(lang, user, pagination, filter);
  }

  @Post("update/:id")
  async updateEmployee(@Body() body: dtos.UpdateEmployeeDto, @Param('id') id: string) {
    return this.employeesService.updateEmployee(body, id);
  }
}
