import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMenuDto } from './dtos/create-menu.dto';
import { CreateMenuItemsDto } from './dtos/create-menuItems.dto';
import { CreatePrivilegeDto } from './dtos/create-privileges.dto';
import { Prisma } from 'src/generated/postgres/prisma/client';
import { CreateDepartmentDto } from './dtos/create-department.dto';
import { activeStatusEnums, genderEnums, isDeleteStatusEnums, languageEnums, projectEnums, promiseStatusEnums, superAdminEnums } from 'src/common/enums/shared.enum';
import { CreateServiceConfigDto } from './dtos/create-service-config.dto';
import { CreateServiceDto } from './dtos/create-service.dto';
import { CreateSafeDto } from './dtos/create-safe.dto';
import { CreateUserTypesDto } from './dtos/create-user-types.dto';
import { CreatePositionsDto } from './dtos/create-positions.dto';

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

  async createSafe(data: CreateSafeDto, user: { user_name: string, company_project_id: number, employee_id: string }) {

    try {
      return this.prisma.safes.create({ data: { ...data, created_by: user.user_name } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation        
        if (error.code === "P2002") {
          throw new ConflictException(`Safe name "${data}" already exists`);
        }
        // Foreign key constraint failed
        if (error.code === "P2003") {
          throw new BadRequestException("Invalid foreign key reference");
        }
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException("Invalid data provided");
      }

      // Fallback for unexpected errors
      throw new InternalServerErrorException("Failed to create Safe");
    }
  }

  async createUserTypes(data: CreateUserTypesDto, user: { user_name: string, company_project_id: number, employee_id: string }) {

    try {
      return this.prisma.user_types.createMany({ data: data.userTypes.map(userType => ({ ...userType, created_by: user.user_name })) });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation        
        if (error.code === "P2002") {
          throw new ConflictException(`User Type name "${data}" already exists`);
        }
        // Foreign key constraint failed
        if (error.code === "P2003") {
          throw new BadRequestException("Invalid foreign key reference");
        }
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException("Invalid data provided");
      }

      // Fallback for unexpected errors
      throw new InternalServerErrorException("Failed to create User Type");
    }
  }

  async createPositions(data: CreatePositionsDto, user: { role_name:string, user_name: string, company_project_id: number, employee_id: string }) {
    
    if (user.role_name == superAdminEnums.ROLE_EN_NAME && data.positions.some(position => !position.project_id)) {
      throw new BadRequestException("Project ID is required for positions when the user is a super admin");
    }
    try {      
      return this.prisma.positions.createMany({ data: data.positions.map(position => ({ ...position,
        project_id: user.role_name == superAdminEnums.ROLE_EN_NAME ? position.project_id : user.company_project_id
        ,created_by: user.user_name })) });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation        
        if (error.code === "P2002") {
          throw new ConflictException(`Position name "${data}" already exists`);
        }
        // Foreign key constraint failed
        if (error.code === "P2003") {
          throw new BadRequestException("Invalid foreign key reference");
        }
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException("Invalid data provided");
      }

      // Fallback for unexpected errors
      throw new InternalServerErrorException("Failed to create Position");
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

  async getServiceConfigs(language: 'en' | 'ar', user: any) {
    const serviceConfigs = await this.prisma.service_config.findMany({
      where: {
        ...(user.role_name === superAdminEnums.ROLE_EN_NAME) ? {} : { project_id: user.company_project_id },
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
      const start_date: Date = data.start_date ? new Date(data.start_date) : new Date();

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
          ...(user.role_name === superAdminEnums.ROLE_EN_NAME ? {} : { project_id: user.company_project_id })
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
          ...(user.role_name === superAdminEnums.ROLE_EN_NAME ? {} : { project_id: user.company_project_id })
        }
      }
    });
    const formattedServices = services.map((service) => {
      const { departments, service_config, en_name, ar_name, employees_services_created_byToemployees, ...rest } = service;
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

  async getAllDropDowns(language: 'en' | 'ar', user: any) {
    const [menuItems, privileges, departments, positions, safes, user_types] = await Promise.allSettled([
      this.prisma.menuItems.findMany({
        where: { is_deleted: isDeleteStatusEnums.NOT_DELETED }
      }),
      this.prisma.privileges.findMany({
        where: { is_deleted: isDeleteStatusEnums.NOT_DELETED }
      }),
      this.prisma.departments.findMany({
        where: { is_deleted: isDeleteStatusEnums.NOT_DELETED, project_id: user.company_project_id,
          status: activeStatusEnums.ACTIVE
         }
      }),
      this.prisma.positions.findMany({
        where: { is_deleted: isDeleteStatusEnums.NOT_DELETED, project_id: user.company_project_id,
          status: activeStatusEnums.ACTIVE
         }
      }),
      this.prisma.safes.findMany({
        where: { OR: [{ project_id: user.company_project_id }, { project_id: projectEnums.ALL_PROJECTS }] }
      }),
      this.prisma.user_types.findMany({
        where: { project_id: projectEnums.ALL_PROJECTS }
      })
    ])
    if (menuItems.status == promiseStatusEnums.REJECTED || privileges.status == promiseStatusEnums.REJECTED ||
      departments.status == promiseStatusEnums.REJECTED || positions.status == promiseStatusEnums.REJECTED || safes.status == promiseStatusEnums.REJECTED ||
      user_types.status == promiseStatusEnums.REJECTED) {
      throw new InternalServerErrorException("Failed to fetch dropdown data");
    }
    return {
      menuItems: menuItems.status === 'fulfilled' ? menuItems.value.map(item => ({ id: item.id, name: item[`${language}_name`] })) : [],
      privileges: privileges.status === 'fulfilled' ? privileges.value.map(item => ({ id: item.id, name: item[`${language}_name`] })) : [],
      departments: departments.status === 'fulfilled' ? departments.value.map(item => ({ id: item.id, name: item[`${language}_name`] })) : [],
      positions: positions.status === 'fulfilled' ? positions.value.map(item => ({ id: item.id, name: item[`${language}_name`] })) : [],
      safes: safes.status === 'fulfilled' ? safes.value.map(item => ({ id: item.id, name: item[`${language}_name`] })) : [],
      user_types: user_types.status === 'fulfilled' ? user_types.value.map(item => ({ id: item.id, name: item[`${language}_name`] })) : [],
      active_status: [{ id : activeStatusEnums.ACTIVE, name : language === languageEnums.ARABIC ? 'نشط' : 'Active' }, { id : activeStatusEnums.INACTIVE, name : language === languageEnums.ARABIC ? 'غير نشط' : 'Inactive' }],
      delete_status: [{ id : isDeleteStatusEnums.NOT_DELETED, name : language === languageEnums.ARABIC ? 'غير محذوف' : 'Not Deleted' }, { id : isDeleteStatusEnums.DELETED, name : language === languageEnums.ARABIC ? 'محذوف' : 'Deleted' }],
      language : [{ id : languageEnums.ENGLISH, name : 'English' }, { id : languageEnums.ARABIC, name : 'Arabic' }],
      gender: [{ id : genderEnums.MALE, name : language === languageEnums.ARABIC ? 'ذكر' : 'Male' }, { id : genderEnums.FEMALE, name : language === languageEnums.ARABIC ? 'انثى' : 'Female' }],
    };
  }
}
