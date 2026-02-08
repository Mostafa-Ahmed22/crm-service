import { Body, Controller, Post, Req } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { adminsEnums } from 'src/auth/enums/auth.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateEmployeeDto } from './dtos/create-employee.dto';

@Controller('employees')
export class EmployeesController {
  constructor(private employeesService: EmployeesService) { }
  
  @Roles(adminsEnums.en.SUPER_ADMIN, adminsEnums.en.SITE_ADMIN)
  @Post("create")
  async createEmployee(@Req() req, @Body() body: CreateEmployeeDto) {
    return this.employeesService.createEmployee(req.user, body);
  }
}
