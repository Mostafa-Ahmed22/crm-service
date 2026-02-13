import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from "./password.service";
import { MailService } from "src/mail/mail.service";
import { LoginDto } from "./dtos/login.dto";
import { HelperService } from "src/helper/helper.service";
import { Prisma } from "src/generated/postgres/prisma/client";
import { mailerEnums } from "src/common/enums/shared.enum";
import { ChangePasswordDto } from "./dtos/change-password.dto";
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly helperService: HelperService,
    private readonly mailerService: MailService
  ) { }
  async validateEmployee(body: LoginDto) {
    const { email, password } = body;
    const employee = await this.prisma.employees.findUnique({
      where: { email },
      include: { roles: { include: { company_project: true } } },
    });

    if (!employee) return null;

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
      employee_id: employee.id, role_name: employee.roles.en_name, role_id: employee.roles.id, user_name: employee.user_name, employee_name: employee.full_name,
      company_project_id: employee.roles.company_project_id, company_code: employee.roles.company_project.company_code,
      project_code: employee.roles.company_project.project_code, project_name: employee.roles.company_project.en_name,
    };
    return { ...payload, access_token: this.jwtService.sign(payload) };
  }

  async resetPassword(employee_id: string) {
    try {
      ;
      const existingEmployee = await this.prisma.employees.findFirst({
        where: { id: employee_id }
      });
      
      if (!existingEmployee) {
        throw new ConflictException('Email or User Name is not exists');
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
    throw new InternalServerErrorException("Failed to assign modules to role");
    }
  }

  async changePassword(employee_id: string, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword, confirmPassword } = changePasswordDto;
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New password and confirm password do not match');
    }
    // const employee = this.prisma.employees.findUnique({ where: { id: user.employee_id } });
    const employee = await this.prisma.employees.findUnique({ where: { 
      id: employee_id
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
      where: { id: employee_id },
      data: { password: hashed }
    });
    if (!updatedEmployee) {
      throw new InternalServerErrorException('Failed to update employee password');
    }
    return { message: 'Password changed successfully' };  
  }
}