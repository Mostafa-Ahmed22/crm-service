import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { adminsEnums } from 'src/auth/enums/auth.enum';
import { Prisma } from 'src/generated/postgres/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoleDto } from './dtos/create-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

    async createRole(data: CreateRoleDto, user: any) {
    let { en_name, ar_name, company_project_id } = data;

    if (!company_project_id) {
      company_project_id = user.company_project_id
    }
    try {
      return await this.prisma.roles.create({ data: { en_name, ar_name, company_project_id, created_by: user.employee_name } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === "P2002") {
          throw new ConflictException(`Role with name "${data.en_name}" already exists`);
        }
        // Foreign key constraint failed
        if (error.code === "P2003") {
          throw new BadRequestException("Invalid foreign key reference");
        }
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException("Invalid data provided");
      }

      // Fallback for unexpected errors
      throw new InternalServerErrorException("Failed to create role");
    }
  }

    async getRoles(language: string, user: any, filter: string) {

    const userRoleName = user.role_name;
    // fix sign with dto
    let company_project_id: any;
    company_project_id = +user.company_project_id;

    const roles = await this.prisma.roles.findMany({
      where: {
        created_by: { not: null }, [`${language}_name`]: { contains : filter, mode: 'insensitive'},
        ...(userRoleName !== adminsEnums.en.SUPER_ADMIN ? { company_project_id: company_project_id } : {})

      }
    });

    // Transform into [{id, name}]
    const result: { id: string; name: string }[] = roles.map(r => { return { id: r.id, name: r[`${language}_name`] } });

    return result;
  }

  async assignFeatureToRole(data: { features: { role_id: string, module_id: number, feature_id: number, status: number }[] }) {
    try {
      const results = await Promise.all(
        data.features.map((feature) =>
          this.prisma.role_features.upsert({
            where: {
              role_id_module_id_feature_id: {
                role_id: feature.role_id,
                module_id: feature.module_id,
                feature_id: feature.feature_id,
              },
            },
            update: {
              status: feature.status,
              updated_at: new Date() // update only status if exists
            },
            create: feature, // insert if not exists
          })
        )
      );

      return results;

    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          throw new BadRequestException("Invalid foreign key reference for role_id or menu_id");
        }
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException("Invalid data provided");
      }

      throw new InternalServerErrorException("Failed to assign modules to role");
    }
  }
  async getRoleFeatures(role_id: string, language: 'en' | 'ar') {

    const features = await this.prisma.role_features.findMany({
      where: { role_id, status: 1 },
      include: {
        modules: { include: { menu: true } },
        features: true,
      },
    });

    // Transform into nested structure
    const result: Record<string, any> = {};

    for (const f of features) {
      const menuName = f.modules.menu[`${language}_name`];
      const moduleName = f.modules[`${language}_name`];
      const featureName = f.features[`${language}_name`];

      if (!result[menuName]) {
        result[menuName] = {
          id: f.modules.menu.id,
          modules: {},
        };
      }

      if (!result[menuName].modules[moduleName]) {
        result[menuName].modules[moduleName] = {
          id: f.modules.id,
          name: moduleName,
          features: [],
        };
      }

      result[menuName].modules[moduleName].features.push({
        id: f.features.id,
        name: featureName,
        status: f.status,
      });
    }

    // Convert modules object → array
    const menus = Object.entries(result).map(([menuName, menu]) => ({
      menuName,
      id: menu.id,
      modules: Object.values(menu.modules),
    }));

    return menus;
  }

}
