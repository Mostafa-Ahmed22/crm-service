import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from "./password.service";
import { MailService } from "src/mail/mail.service";
import { LoginDto } from "./dtos/login.dto";
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
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
      employee_id: employee.id, role_name: employee.roles.en_name, role_id: employee.roles.id, employee_name: employee.full_name,
      company_project_id: employee.roles.company_project_id, company_code: employee.roles.company_project.company_code,
      project_code: employee.roles.company_project.project_code, project_name: employee.roles.company_project.en_name,
    };
    return { ...payload, access_token: this.jwtService.sign(payload) };
  }


}