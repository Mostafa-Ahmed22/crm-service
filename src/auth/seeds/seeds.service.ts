import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { PasswordService } from "../password.service";
import { activeStatusEnums, isDeleteStatusEnums, safeEnums, superAdminEnums } from "src/common/enums/shared.enum";

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService
  ) { }

  async onModuleInit() {
    // 1. Seed company_project entry
    const companyProject = await this.prisma.company_project.upsert({
      where: { company_code_project_code: { company_code: "*", project_code: "*" } },
      update: {},
      create: { company_code: "*", project_code: "*", ar_name: "*", en_name: "*" },
    });

    // 2. Seed SuperAdmin role
    const adminRole = await this.prisma.roles.upsert({
      where: { en_name_company_project_id_is_deleted: { en_name: superAdminEnums.ROLE_EN_NAME,
      company_project_id: companyProject.id, is_deleted: isDeleteStatusEnums.NOT_DELETED 
        } 
      },
      update: {},
      create: {
        en_name: superAdminEnums.ROLE_EN_NAME, ar_name: superAdminEnums.ROLE_AR_NAME,
        company_project_id: companyProject.id
      },
    });

    // 3. Seed SuperAdmin department
    const adminDepartment = await this.prisma.departments.upsert({
      where: { project_id_en_name_is_deleted: { project_id: companyProject.id, en_name: superAdminEnums.DEPARTMENT_EN_NAME,
        is_deleted: isDeleteStatusEnums.NOT_DELETED
       } },
      update: {},
      create: {
        en_name: superAdminEnums.DEPARTMENT_EN_NAME,
        ar_name:superAdminEnums.DEPARTMENT_AR_NAME,
        project_id: companyProject.id,
        status: activeStatusEnums.INACTIVE
      },
    });
    // 4. Seed SuperAdmin position
    const adminPosition = await this.prisma.positions.upsert({
      where: { project_id_en_name_is_deleted: { project_id: companyProject.id, en_name: superAdminEnums.POSITION_EN_NAME
        , is_deleted: isDeleteStatusEnums.NOT_DELETED
       } },
      update: {},
      create: {
        en_name: superAdminEnums.POSITION_EN_NAME,
        ar_name:superAdminEnums.POSITION_AR_NAME,
        project_id: companyProject.id,
        status: activeStatusEnums.INACTIVE
      },
    });

    const adminSafe = await this.prisma.safes.upsert({
      where: { 
        project_id_en_name: {
          project_id: companyProject.id, 
          en_name: safeEnums.DEFAULT_SAFE_EN_NAME,
        }
      },
      update: {},
      create: {
        en_name: safeEnums.DEFAULT_SAFE_EN_NAME,
        ar_name: safeEnums.DEFAULT_SAFE_AR_NAME,
        project_id: companyProject.id,
      },
    });
    // 5. Seed Super Admin employee
    const existingAdmin = await this.prisma.employees.findUnique({
      where: { email: superAdminEnums.EMAIL },
    });

    if (!existingAdmin) {
      const hashed = await this.passwordService.hashPassword(superAdminEnums.PASSWORD);
      await this.prisma.employees.create({
        data: {
          email: superAdminEnums.EMAIL,
          user_name: superAdminEnums.USER_NAME,
          full_name: superAdminEnums.FULL_NAME,
          phone_number: superAdminEnums.PHONE_NUMBER,
          is_male : superAdminEnums.IS_MALE,
          password: hashed,
          role_id: adminRole.id,
          department_id:adminDepartment.id,
          position_id: adminPosition.id,
          safe_id: adminSafe.id,
        },
      });
      console.log("Super Admin seeded successfully");
    } else {
      console.log("Super Admin already exists");
    }
  }

}