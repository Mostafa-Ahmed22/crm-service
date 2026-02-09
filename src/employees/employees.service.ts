import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmployeeDto } from './dtos/create-employee.dto';
import { PasswordService } from 'src/auth/password.service';
import { MailService } from 'src/mail/mail.service';
import { HelperService } from 'src/helper/helper.service';
import { Prisma } from 'src/generated/postgres/prisma/client';

@Injectable()
export class EmployeesService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private readonly helperService: HelperService,
    private readonly mailerService: MailService
  ) {}
    async createEmployee(user, body: CreateEmployeeDto) {
      try {
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
  
        const password = this.helperService.generateRandomPass(8)
        
        const hashed = await this.passwordService.hashPassword(password);
        const employee = await this.prisma.employees.create({ data: { ...body, password: hashed } })
        if (!employee) {
          throw new InternalServerErrorException('Failed to create employee');
        }
        await this.mailerService.sendMail({
          to: [body.email],
          subject: 'Welcome to My Porto CRM!',
          html: this.helperService.getPasswordTemplate(body.full_name, password),
        });
        const { password: _, ...result } = employee;
  
        return result;
        
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          // Foreign key constraint failed
          throw new BadRequestException("Invalid foreign key reference");
        }
        // Unique constraint violation
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException("Invalid data provided");
      }
      // Fallback for unexpected errors
      throw new InternalServerErrorException("Failed to assign modules to role");
      }
    }
}
