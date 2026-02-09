import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMenuDto } from './dtos/create-menu.dto';
import { CreateModuleDto } from './dtos/create-modules.dto';
import { CreateFeatureDto } from './dtos/create-features.dto';
import { Prisma } from 'src/generated/postgres/prisma/client';

@Injectable()
export class ModulesService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async createMenu(data: CreateMenuDto ) {

    try {
      return await this.prisma.menu.createMany({ data: data.menuItems });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === "P2002") {
          throw new ConflictException(`Role with name "${data}" already exists`);
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

    async createModule(data: CreateModuleDto) {
    try {
      const itemsWithMenuId = data.moduleItems.map(item => ({
        ...item,
        menu_id: data.menu_id,   // inject menu_id into each record
      }));

      return await this.prisma.modules.createMany({ data: itemsWithMenuId });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          throw new BadRequestException("Invalid foreign key reference for menu_id");
        }
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException("Invalid data provided");
      }

      throw new InternalServerErrorException("Failed to create module");
    }
  }

  async createFeature(data: CreateFeatureDto) {
    try {
      return await this.prisma.features.createMany({ data: data.featureItems });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === "P2002") {
          throw new ConflictException(`Role with name "${data}" already exists`);
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

  async getFeatures(language: 'en' | 'ar', filter:string) {
    const features = await this.prisma.module_features.findMany({
      where: { status: 1, modules : {[`${language}_name`]: { contains : filter, mode: 'insensitive'}} },
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

  async assignFeaturesToModule(data: { features: { module_id: number, feature_id: number, status: number }[] }) {
    try {
      const results = await Promise.all(
        data.features.map((feature) =>
          this.prisma.module_features.upsert({
            where: {
              module_id_feature_id: {
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

}
