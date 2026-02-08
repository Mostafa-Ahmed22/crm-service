import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmployeeDto } from './dtos/create-employee.dto';
import { PasswordService } from 'src/auth/password.service';

@Injectable()
export class EmployeesService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService
  ) {}
    async createEmployee(user, body: CreateEmployeeDto) {
      const { email, user_name } = body;
      const existingEmployee = await this.prisma.employees.findFirst({
        where: {  OR: [
          { email },
        { user_name }
      ] }
      });
  
      if (existingEmployee) {
        throw new ConflictException('Email or User Name already exists');
      }
      const hashed = await this.passwordService.hashPassword(body.password);
      const employee = await this.prisma.employees.create({ data: { ...body, password: hashed } });
  
      if (!employee) {
        throw new InternalServerErrorException('Failed to create employee');
      }
      const { password: _, ...result } = employee;
  
      return result;
  
    }
}
