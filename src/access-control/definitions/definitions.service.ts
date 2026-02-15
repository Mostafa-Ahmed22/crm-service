import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMenuDto } from './dtos/create-menu.dto';
import { CreateMenuItemsDto } from './dtos/create-menuItems.dto';
import { CreatePrivilegeDto } from './dtos/create-privileges.dto';
import { Prisma } from 'src/generated/postgres/prisma/client';
import { CreateDepartmentDto } from './dtos/create-department.dto';
import { isDeleteStatusEnums, superAdminEnums } from 'src/common/enums/shared.enum';
import { CreateServiceConfigDto } from './dtos/create-service-config.dto';
import { CreateServiceDto } from './dtos/create-service.dto';

@Injectable()
export class DefinitionsService {
  constructor(
    private prisma: PrismaService,
  ) { }

  async createMenu(data: CreateMenuDto) {

    try {
      return await this.prisma.menu.createMany({ data: data.menus });
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
  async createDepartment(data: CreateDepartmentDto, user: { user_name: string, company_project_id: number, employee_id: string }) {

    try {
      return await this.prisma.departments.create({ data: { ...data, project_id: user.company_project_id, created_by: user.user_name } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === "P2002") {
          throw new ConflictException(`Department name "${data}" already exists`);
        }
        // Foreign key constraint failed
        if (error.code === "P2003") {
          throw new BadRequestException("Invalid foreign key reference");
        }
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException("Invalid data provided");
      }

      // Fallback for unexpected errors
      throw new InternalServerErrorException("Failed to create Department");
    }

  }

  async createMenuItems(data: CreateMenuItemsDto) {
    try {
      return await this.prisma.menuItems.createMany({ data: data.menuItems });
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

  async createPrivilege(data: CreatePrivilegeDto) {
    try {
      return await this.prisma.privileges.createMany({ data: data.privilegeItems });
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

  async getPrivileges(language: 'en' | 'ar', filter: string) {
    const privileges = await this.prisma.menuItem_privileges.findMany({
      where: {
        status: 1,
        privileges: { is_deleted: isDeleteStatusEnums.NOT_DELETED },
        menuItems: {
          [`${language}_name`]: { contains: filter, mode: 'insensitive' }, is_deleted: isDeleteStatusEnums.NOT_DELETED
          , menu: { is_deleted: isDeleteStatusEnums.NOT_DELETED }
        }
      },
      include: {
        menuItems: { include: { menu: true } },
        privileges: true,
      },
    });

    // Transform into nested structure
    const result: Record<string, any> = {};

    for (const privilege of privileges) {
      const menuName = privilege.menuItems.menu[`${language}_name`];
      const menuItemName = privilege.menuItems[`${language}_name`];
      const privilegeName = privilege.privileges[`${language}_name`];

      if (!result[menuName]) {
        result[menuName] = {
          id: privilege.menuItems.menu.id,
          menuItems: {},
        };
      }

      if (!result[menuName].menuItems[menuItemName]) {
        result[menuName].menuItems[menuItemName] = {
          id: privilege.menuItems.id,
          name: menuItemName,
          privileges: [],
        };
      }

      result[menuName].menuItems[menuItemName].privileges.push({
        id: privilege.privileges.id,
        name: privilegeName,
        status: privilege.status,
      });
    }

    // Convert modules object → array
    const menus = Object.entries(result).map(([menuName, menu]) => ({
      menuName,
      id: menu.id,
      menuItems: Object.values(menu.menuItems),
    }));

    return menus;
  }

  async assignPrivilegeToMenuItems(data: { privileges: { menuItem_id: number, privilege_id: number, status: number }[] }) {
    try {
      const results = await Promise.all(
        data.privileges.map((privilege) =>
          this.prisma.menuItem_privileges.upsert({
            where: {
              menuItem_id_privilege_id: {
                menuItem_id: privilege.menuItem_id,
                privilege_id: privilege.privilege_id,
              },
            },
            update: {
              status: privilege.status,
              updated_at: new Date() // update only status if exists
            },
            create: privilege, // insert if not exists
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

  async createServiceConfig(user: { user_name: string, company_project_id: number, employee_id: string }, data: CreateServiceConfigDto) {

    try {
      if (!data.project_id) {
        data.project_id = user.company_project_id;
      }
      return this.prisma.service_config.create({
        data: { ...data, created_by: user.employee_id }
      });

    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === "P2002") {
          throw new ConflictException(`Service config with name "${data}" already exists`);
        }
        // Foreign key constraint failed
        if (error.code === "P2003") {
          throw new BadRequestException("Invalid foreign key reference");
        }
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException("Invalid data provided");
      }
      throw new InternalServerErrorException("Failed to create service config");
    }
  }

  async getServiceConfigs(language: 'en' | 'ar', user:any) {
    const serviceConfigs = await this.prisma.service_config.findMany({
      where: {
        ...(user.role === superAdminEnums.ROLE_EN_NAME) ? {} : { project_id: user.company_project_id },
        is_deleted: isDeleteStatusEnums.NOT_DELETED
      },
      include: {
        company_project: {
          select: {
            [`${language}_name`]: true,
          }
        },
        employees_service_config_created_byToemployees: {
          select: {
            full_name: true,
          }
        }
      },
      
    });
    return serviceConfigs.map((serviceConfig) => {
      const { company_project, ...rest } = serviceConfig;
      return {
        ...rest,
        project_name: company_project ? company_project[`${language}_name`] : null,
      };
    });
      }
  async createService(user: { user_name: string, company_project_id: number, employee_id: string }, data: CreateServiceDto) {
    try {
      let start_date: Date = new Date();
      if (data.start_date) {
        start_date = new Date(data.start_date); // Convert to YYYY-MM-DD format
      }
      return this.prisma.services.create({
        data: { ...data, created_by: user.employee_id, start_date }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === "P2002") {
          throw new ConflictException(`Service config with name "${data}" already exists`);
        }
        // Foreign key constraint failed
        if (error.code === "P2003") {
          throw new BadRequestException("Invalid foreign key reference");
        }
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException("Invalid data provided");
      }
      throw new InternalServerErrorException("Failed to create service config");
    }
  }

  async getServices(user: any, pagination: { page: number, limit: number, skip: number }, language: 'en' | 'ar') {
    const services = await this.prisma.services.findMany({
      where: {
        is_deleted: isDeleteStatusEnums.NOT_DELETED,
        departments: {
          is_deleted: isDeleteStatusEnums.NOT_DELETED,
        },
        service_config: {
          is_deleted: isDeleteStatusEnums.NOT_DELETED,
          ...(user.role === superAdminEnums.ROLE_EN_NAME ? {} : { project_id: user.company_project_id })
        }
      },
      skip: pagination.skip,
      take: pagination.limit,
      include: {
        departments: {
          select: {
            [`${language}_name`]: true,
          }
        },
        service_config: true,
        employees_services_created_byToemployees: {
          select: {
            full_name: true,
          }
        }
        
      },
    });

    const totalCount = await this.prisma.services.count({
      where: {
        is_deleted: isDeleteStatusEnums.NOT_DELETED,
        departments: {
          is_deleted: isDeleteStatusEnums.NOT_DELETED,
        },
        service_config: {
          is_deleted: isDeleteStatusEnums.NOT_DELETED,
          ...(user.role === superAdminEnums.ROLE_EN_NAME ? {} : { project_id: user.company_project_id })
        }
      }
    });
    const formattedServices = services.map((service) => {
      const { departments, service_config, en_name, ar_name,employees_services_created_byToemployees, ...rest } = service;
      return {
        ...rest,
        department_name: departments ? departments[`${language}_name`] : null,
        created_by_name: employees_services_created_byToemployees ? employees_services_created_byToemployees.full_name : null,
        
      };
    });              
    return {
      totalCount,
      totalPages: Math.ceil(totalCount / pagination.limit),
      services: formattedServices
    }
  }
}
