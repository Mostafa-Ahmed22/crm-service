import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from "./password.service";
import { MailService } from "src/mail/mail.service";
import { HelperService } from "src/helper/helper.service";
import { Prisma } from "src/generated/postgres/prisma/client";
import { isDeleteStatusEnums, mailerEnums } from "src/common/enums/shared.enum";
import * as dtos from "./dtos/index.dtos";
import type * as interfaces from 'src/common/interfaces/index.interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly helperService: HelperService,
    private readonly mailerService: MailService
  ) { }
  async validateEmployee(body: dtos.LoginDto) {
    const { email, password } = body;
    const employee = await this.prisma.employees.findUnique({
      where: { email },
      include: { roles_employees_role_idToroles: { include: { company_project: true } } },
    });

    if (!employee) return null;
    
    if (employee.roles_employees_role_idToroles?.is_deleted === isDeleteStatusEnums.DELETED) 
      throw new BadRequestException('Your role has been deleted, please contact administrator');
    
    if (employee.is_deleted === isDeleteStatusEnums.DELETED) 
      throw new BadRequestException('Your account has been deleted, please contact administrator');

    if (employee.is_locked === isDeleteStatusEnums.DELETED) 
      throw new BadRequestException('Your account has been locked, please contact administrator');

    const valid = await this.passwordService.verifyPassword(password, employee.password);
    if (!valid) return null;

    // If old PBKDF2 hash, rehash with Argon2
    if (!employee.password.startsWith("$argon2")) {
      const newHash = await this.passwordService.hashPassword(password);
      await this.prisma.employees.update({ where: { id: employee.id }, data: { password: newHash } });
    }
    await this.prisma.employees.update({ where: { id: employee.id }, data: { last_login_date: new Date() } });

    return employee;
  }

  async login(employee: any, language: 'en' | 'ar') {
    const payload = {
      employee_id: employee.id, role_name: employee.roles_employees_role_idToroles.en_name, role_id: employee.roles_employees_role_idToroles.id, user_name: employee.user_name, employee_name: employee.full_name,
      company_project_id: employee.roles_employees_role_idToroles.company_project_id, company_code: employee.roles_employees_role_idToroles.company_project.company_code,
      project_code: employee.roles_employees_role_idToroles.company_project.project_code, project_name: employee.roles_employees_role_idToroles.company_project.en_name,
    };
    return { ...payload, access_token: this.jwtService.sign(payload) };
  }

  async resetPassword(body: dtos.ResetPasswordDto) {
    const { employee_id } = body;
    try {
      ;
      const existingEmployee = await this.prisma.employees.findFirst({
        where: { id: employee_id }
      });
      
      if (!existingEmployee) {
        throw new ConflictException('Email or User Name does not exist');
      }

      const password = this.helperService.generateRandomPass(8)
      
      const hashed = await this.passwordService.hashPassword(password);
      const employee = await this.prisma.employees.update({ where: { id: employee_id }, data: { password: hashed } })
      
      if (!employee) {
        throw new InternalServerErrorException('Failed to reset employee password');
      }
      if (!existingEmployee.email) {
        throw new BadRequestException('Employee email is missing');
      }
      await this.mailerService.sendMail({
        to: [existingEmployee.email],
        subject: mailerEnums.MAILER_SUBJECT,
        html: this.helperService.getPasswordTemplate(employee.full_name, password),
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
    throw new BadRequestException("Failed to assign modules to role");
    }
  }

  async changePassword(user: interfaces.User, changePasswordDto: dtos.ChangePasswordDto) {
    const { oldPassword, newPassword, confirmPassword } = changePasswordDto;
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New password and confirm password do not match');
    }
    // const employee = this.prisma.employees.findUnique({ where: { id: user.employee_id } });
    const employee = await this.prisma.employees.findUnique({ where: { 
      id: user.employee_id
    } });

    if (!employee) {
      throw new BadRequestException('Employee not found');
    }
    
    const valid = await this.passwordService.verifyPassword(oldPassword, employee.password);

    if (!valid) {
      throw new BadRequestException('Old password is incorrect');
    }
    const hashed = await this.passwordService.hashPassword(newPassword);
    
    const updatedEmployee = await this.prisma.employees.update({
      where: { id: user.employee_id },
      data: { password: hashed }
    });
    if (!updatedEmployee) {
      throw new InternalServerErrorException('Failed to update employee password');
    }
    return { message: 'Password changed successfully' };  
  }
}