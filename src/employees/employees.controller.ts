import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dtos/create-employee.dto';
import { UpdateEmployeeDto } from './dtos/update-employee.dto';

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

  @Post("update/:id")
  async updateEmployee(@Req() req, @Body() body: UpdateEmployeeDto, @Param('id') id: string) {
    return this.employeesService.updateEmployee(req.user, body, id);
  }
}
