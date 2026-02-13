import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dtos/create-employee.dto';

@Controller('employees')
export class EmployeesController {
  constructor(private employeesService: EmployeesService) { }
  
  @Post()
  async createEmployee(@Req() req, @Body() body: CreateEmployeeDto) {
    return this.employeesService.createEmployee(req.user, body);
  }

  @Get() 
  async getAllEmployees(@Req() req, @Query('name') filter: string) {
    return this.employeesService.getAllEmployees(req.lang, req.user, req.pagination, filter);
  }
}
