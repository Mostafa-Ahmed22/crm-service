import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { activeStatusEnums, genderEnums, isDeleteStatusEnums, languageEnums, projectEnums, promiseStatusEnums, superAdminEnums } from 'src/common/enums/shared.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'src/generated/postgres/prisma/client';
import { HelperService } from 'src/helper/helper.service';
import * as dtos from './dtos/index.dto';
import type * as interfaces from 'src/common/interfaces/index.interfaces';

@Injectable()
export class DefinitionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService
  ) { }

  async createProjects(data: dtos.CreateProjectDto) {
    try {
      return await this.prisma.company_project.createMany({ data: data.projects });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === "P2002") {
          throw new ConflictException(`Project with name "${data.projects.map(p => p.en_name).join(', ')}" already exists`);
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
  async createMenu(data: dtos.CreateMenuDto) {

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
  async createDepartment(user: interfaces.User, data: dtos.CreateDepartmentDto) {

    try {
      return await this.prisma.departments.create({ data: { ...data, project_id: user.company_project_id, created_by: user.employee_id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === "P2002") {
          throw new ConflictException(`Department already exists`);
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

  async createSafe(user: interfaces.User, data: dtos.CreateSafeDto) {

    try {
      return this.prisma.safes.create({ data: { ...data,
        project_id: data.project_id ? data.project_id : user.company_project_id, created_by: user.employee_id } });
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

  async createEmployeeTypes(user: interfaces.User, data: dtos.CreateEmployeeTypesDto) {

    try {
      return this.prisma.employee_types.createMany({ data: data.employee_types.map(employeeType => ({ ...employeeType, created_by: user.employee_id })) });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation        
        if (error.code === "P2002") {
          throw new ConflictException(`Employee Type name "${data}" already exists`);
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

  async createPositions(user: interfaces.User, data: dtos.CreatePositionsDto) {

    if (user.role_name == superAdminEnums.ROLE_EN_NAME && data.positions.some(position => !position.project_id)) {
      throw new BadRequestException("Project ID is required for positions when the user is a super admin");
    }
    try {
      return this.prisma.positions.createMany({
        data: data.positions.map(position => ({
          ...position,
          project_id: user.role_name == superAdminEnums.ROLE_EN_NAME ? position.project_id : user.company_project_id
          , created_by: user.employee_id
        }))
      });
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

  async createMenuitems(data: dtos.CreateMenuitemsDto) {
    try {      
      return await this.prisma.menuitems.createMany({ data: data.menuitems });
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

  async createPrivilege(data: dtos.CreatePrivilegeDto) {
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

  async getPrivileges(language: string, filter: string) {
    const privileges = await this.prisma.menuitem_privileges.findMany({
      where: {
        status: 1,
        privileges: { is_deleted: isDeleteStatusEnums.NOT_DELETED },
        menuitems: {
          [`${language}_name`]: { contains: filter, mode: 'insensitive' }, is_deleted: isDeleteStatusEnums.NOT_DELETED
          , menu: { is_deleted: isDeleteStatusEnums.NOT_DELETED }
        }
      },
      include: {
        menuitems: { include: { menu: true } },
        privileges: true,
      },
    });

    // Transform into nested structure
    const result: Record<string, any> = {};

    for (const privilege of privileges) {
      const menuName = privilege.menuitems.menu[`${language}_name`];
      const menuItemName = privilege.menuitems[`${language}_name`];
      const privilegeName = privilege.privileges[`${language}_name`];

      if (!result[menuName]) {
        result[menuName] = {
          id: privilege.menuitems.menu.id,
          menuitems: {},
        };
      }

      if (!result[menuName].menuitems[menuItemName]) {
        result[menuName].menuitems[menuItemName] = {
          id: privilege.menuitems.id,
          name: menuItemName,
          href: privilege.menuitems.screen,
          privileges: [],
        };
      }

      result[menuName].menuitems[menuItemName].privileges.push({
        id: privilege.privileges.id,
        name: privilegeName,
        status: privilege.status,
      });
    }

    // Convert modules object → array
    const menus = Object.entries(result).map(([menuName, menu]) => ({
      menuName,
      id: menu.id,
      menuitems: Object.values(menu.menuitems),
    }));

    return menus;
  }

  async assignPrivilegeToMenuitems(data: { privileges: { menuitem_id: number, privilege_id: number, status: number }[] }) {
    try {
      const results = await Promise.all(
        data.privileges.map((privilege) =>
          this.prisma.menuitem_privileges.upsert({
            where: {
              menuitem_id_privilege_id: {
                menuitem_id: privilege.menuitem_id,
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

  async createServiceConfig(user: interfaces.User, data: dtos.CreateServiceConfigDto) {

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

  async getServiceConfigs(user: interfaces.User, language: string,) {
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
  async createService(user: interfaces.User, data: dtos.CreateServiceDto) {
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
        throw new InternalServerErrorException(`Failed to create service config: ${error.message}`);
      }
  }

  async getServices(user: interfaces.User, pagination: interfaces.Pagination, language: string, filter: dtos.ServiceSearchDto) {
    const services = await this.prisma.services.findMany({
      where: {
        id: filter.service_id,
        is_deleted: isDeleteStatusEnums.NOT_DELETED,
        [`${language}_name`]: { contains: filter.service_name, mode: 'insensitive' },
        is_active: filter.is_active,
        show_in_mobile: filter.show_in_mobile,
        start_date: filter.start_date ? new Date(filter.start_date) : undefined,
        departments: {
          is_deleted: isDeleteStatusEnums.NOT_DELETED,
          id: filter.department_id,
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
        id: filter.service_id,
        is_deleted: isDeleteStatusEnums.NOT_DELETED,
        is_active: filter.is_active,
        show_in_mobile: filter.show_in_mobile,
        start_date: filter.start_date ? new Date(filter.start_date) : undefined,
        departments: {
          is_deleted: isDeleteStatusEnums.NOT_DELETED,
          id: filter.department_id,
        },
 
        service_config: {
          is_deleted: isDeleteStatusEnums.NOT_DELETED,
          ...(user.role_name === superAdminEnums.ROLE_EN_NAME ? {} : { project_id: user.company_project_id })
        }
      }
    });
    const formattedServices = services.map((service) => {
      const { departments, service_config, en_name, ar_name, ar_mobile_service_name,
        en_mobile_service_name,employees_services_created_byToemployees, ...rest } = service;
      return {
        service_name: service[`${language}_name`],
        service_mobile_name: service[`${language}_mobile_service_name`],
        department_name: departments ? departments[`${language}_name`] : null,
        created_by_name: employees_services_created_byToemployees ? employees_services_created_byToemployees.full_name : null,
        ...rest

      };
    });
    return {
      totalCount,
      totalPages: Math.ceil(totalCount / pagination.limit),
      services: formattedServices
    }
  }

  async createLocationType(user: interfaces.User, data: dtos.CreateLocationTypesDto) {
    try {
      return this.prisma.location_types.createMany({ data: data.location_types.map(locationType => ({ ...locationType, project_id: locationType.project_id ? locationType.project_id : user.company_project_id, created_by: user.employee_id })) });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === "P2002") {
          throw new ConflictException(`Location Type name "${data}" already exists`);
        }
        // Foreign key constraint failed
        if (error.code === "P2003") {
          throw new BadRequestException("Invalid foreign key reference");
        }
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException("Invalid data provided");
      }
    }
  }

  async createLocation(user: interfaces.User, data: dtos.CreateLocationsDto) {
    try {
      return this.prisma.locations.createMany({ data: data.locations.map(location => ({ ...location, project_id: location.project_id ? location.project_id : user.company_project_id, created_by: user.employee_id })) });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === "P2002") {
          throw new ConflictException(`Location name "${data}" already exists`);
        }
        // Foreign key constraint failed
        if (error.code === "P2003") {
          throw new BadRequestException("Invalid foreign key reference");
        }
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException("Invalid data provided");
      }
    }
  }

  async createRentalCompany(user: interfaces.User, data: dtos.CreateRentalCompaniesDto) {
    try {
      return this.prisma.rental_companies.createMany({
        data: data.rental_companies.map(rentalCompany => ({
          ...rentalCompany,
          project_id: rentalCompany.project_id ? rentalCompany.project_id : user.company_project_id,
          created_by: user.employee_id
        }))
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === "P2002") {
          throw new ConflictException(`Rental Company name already exists`);
        }
        // Foreign key constraint failed
        if (error.code === "P2003") {
          throw new BadRequestException("Invalid foreign key reference");
        }
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException("Invalid data provided");
      }
    }
  }

  async createUnitType(user: interfaces.User, data: dtos.CreateUnitTypesDto) {
    try {
      return this.prisma.unit_types.createMany({ data: data.unit_types.map(unitType => ({ ...unitType, project_id: unitType.project_id ? unitType.project_id : user.company_project_id, created_by: user.employee_id })) });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === "P2002") {
          throw new ConflictException(`Unit Type name already exists`);
        }
        // Foreign key constraint failed
        if (error.code === "P2003") {
          throw new BadRequestException("Invalid foreign key reference");
        }
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException("Invalid data provided");
      }
    }
  }

  async createCountries(user: any, data: dtos.CreateCountriesDto) {
    try {
      return await this.prisma.countries.createMany({ data: data.countries.map(country => ({ ...country, created_by: user.employee_id })) });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === "P2002") {
          throw new ConflictException(`Country with name "${data}" already exists`);
        }
        // Foreign key constraint failed
        if (error.code === "P2003") {
          throw new BadRequestException("Invalid foreign key reference");
        }
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException("Invalid data provided");
      }
    }
  }

  async createCustomerIDTypes(user: any, data: dtos.CreateIDTypesDto) {
    try {
      return await this.prisma.id_types.createMany({ data: data.id_types.map(idType => ({ ...idType, created_by: user.employee_id })) });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === "P2002") {
          throw new ConflictException(`ID Type already exists`);
        }
        // Foreign key constraint failed
        if (error.code === "P2003") {
          throw new BadRequestException("Invalid foreign key reference");
        }
      }
    }
  }

  async createReligions(user: any, data: dtos.CreateReligionsDto) {
    try {
      return await this.prisma.religions.createMany({ data: data.religions.map(religion => ({ ...religion, created_by: user.employee_id })) });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === "P2002") {
          throw new ConflictException(`Religion with name "${data}" already exists`);
        }
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException("Invalid data provided");
      }
    }
  }

  async createMaritalStatuses(user: any, data: dtos.CreateMaritalStatusesDto) {
    try {
      return await this.prisma.marital_statuses.createMany({ data: data.marital_statuses.map(status => ({ ...status, created_by: user.employee_id })) });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === "P2002") {
          throw new ConflictException(`Marital Status with name "${data}" already exists`);
        }
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException("Invalid data provided");
      }
    }
  }

  async createCustomerTypes(user: any, data: dtos.CreateCustomerTypesDto) {
    try {
      return await this.prisma.customer_types.createMany({ data: data.customer_types.map(type => ({ ...type, created_by: user.employee_id })) });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === "P2002") {
          throw new ConflictException(`Customer Type with name "${data}" already exists`);
        }
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException("Invalid data provided");
      }
    }
  }

    async createOwnershipType(user: interfaces.User, data: dtos.CreateOwnershipTypesDto) {
    try {
      return this.prisma.ownership_types.createMany({ data: data.ownership_types.map(ownershipType => ({ ...ownershipType })) });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique constraint violation
        if (error.code === "P2002") {
          throw new ConflictException(`Customer Type with name "${data}" already exists`);
        }
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException("Invalid data provided");
      }
    }
  }


  async getAllDropDowns(user: interfaces.User, language: string) {
    const [menuitems, privileges, departments, positions, safes, employee_types, location_types, locations, rental_companies, unit_types
      , company_projects, countries, id_types, marital_statuses, religions, customer_types, ownership_types
    ] = await Promise.allSettled([
      this.prisma.menuitems.findMany({ where: { is_deleted: isDeleteStatusEnums.NOT_DELETED } }),
      this.prisma.privileges.findMany({ where: { is_deleted: isDeleteStatusEnums.NOT_DELETED } }),
      this.prisma.departments.findMany({
        where: {
          is_deleted: isDeleteStatusEnums.NOT_DELETED,
          status: activeStatusEnums.ACTIVE,
          ...(user.role_name === superAdminEnums.ROLE_EN_NAME ? {} : { project_id: user.company_project_id })
        }
      }),
      this.prisma.positions.findMany({
        where: {
          is_deleted: isDeleteStatusEnums.NOT_DELETED,
          status: activeStatusEnums.ACTIVE,
          ...(user.role_name === superAdminEnums.ROLE_EN_NAME ? {} : { project_id: user.company_project_id })
        }
      }),
      this.prisma.safes.findMany({
        where: {
          OR: [
            ...(user.role_name === superAdminEnums.ROLE_EN_NAME ? [] : [{ project_id: user.company_project_id }]),
            { project_id: projectEnums.ALL_PROJECTS }]
        }
      }),
      this.prisma.employee_types.findMany({ where: { project_id: projectEnums.ALL_PROJECTS } }),
      this.prisma.location_types.findMany({ where: { project_id: user.company_project_id } }),
      this.prisma.locations.findMany({
        where: (user.role_name === superAdminEnums.ROLE_EN_NAME ? {} : { project_id: user.company_project_id }),
        include: { locations: true }
      }),
      this.prisma.rental_companies.findMany({ where: (user.role_name === superAdminEnums.ROLE_EN_NAME ? {} : { project_id: user.company_project_id }) }),
      this.prisma.unit_types.findMany({ where: { project_id: user.company_project_id } }),
      this.prisma.company_project.findMany({
        where: user.role_name === superAdminEnums.ROLE_EN_NAME
          ? { id: { not: projectEnums.ALL_PROJECTS } } : { AND: [{ id: user.company_project_id }, { id: { not: projectEnums.ALL_PROJECTS } }] },
      }),
      this.prisma.countries.findMany({}),
      this.prisma.id_types.findMany({}),
      this.prisma.marital_statuses.findMany({}),
      this.prisma.religions.findMany({}),
      this.prisma.customer_types.findMany({}),
      this.prisma.ownership_types.findMany({}),
    ])

    return {
      menuitems: menuitems.status === 'fulfilled' ? menuitems.value.map(item => ({ id: item.id, name: item[`${language}_name`] })) : [],
      privileges: privileges.status === 'fulfilled' ? privileges.value.map(item => ({ id: item.id, name: item[`${language}_name`] })) : [],
      departments: departments.status === 'fulfilled' ? departments.value.map(item => ({ id: item.id, name: item[`${language}_name`] })) : [],
      positions: positions.status === 'fulfilled' ? positions.value.map(item => ({ id: item.id, name: item[`${language}_name`] })) : [],
      safes: safes.status === 'fulfilled' ? safes.value.map(item => ({ id: item.id, name: item[`${language}_name`] })) : [],
      employee_types: employee_types.status === 'fulfilled' ? employee_types.value.map(item => ({ id: item.id, name: item[`${language}_name`] })) : [],
      location_types: location_types.status === 'fulfilled' ? location_types.value.map(item => ({ id: item.id, name: item[`${language}_name`] })) : [],
      locations: locations.status === 'fulfilled' ? this.helperService.getLocationHierarchy(locations.value, language) : [],
      rental_companies: rental_companies.status === 'fulfilled' ? rental_companies.value.map(item => ({ id: item.id, name: item[`${language}_name`] })) : [],
      unit_types: unit_types.status === 'fulfilled' ? unit_types.value.map(item => ({ id: item.id, name: item[`${language}_name`] })) : [],
      company_projects: company_projects.status === 'fulfilled' ? company_projects.value.map(item => ({ id: item.id, name: item[`${language}_name`] })) : [],
      marital_statuses: marital_statuses.status === 'fulfilled' ? marital_statuses.value.map(item => ({ id: item.id, name: item[`${language}_name`] })) : [],
      religions: religions.status === 'fulfilled' ? religions.value.map(item => ({ id: item.id, name: item[`${language}_name`] })) : [],
      customer_types: customer_types.status === 'fulfilled' ? customer_types.value.map(item => ({ id: item.id, name: item[`${language}_name`] })) : [],
      ownership_types: ownership_types.status === 'fulfilled' ? ownership_types.value.map(item => ({ id: item.id, name: item[`${language}_name`] })) : [],
      active_status: [{ id: activeStatusEnums.ACTIVE, name: language === languageEnums.ARABIC ? 'نشط' : 'Active' }, { id: activeStatusEnums.INACTIVE, name: language === languageEnums.ARABIC ? 'غير نشط' : 'Inactive' }],
      delete_status: [{ id: isDeleteStatusEnums.NOT_DELETED, name: language === languageEnums.ARABIC ? 'غير محذوف' : 'Not Deleted' }, { id: isDeleteStatusEnums.DELETED, name: language === languageEnums.ARABIC ? 'محذوف' : 'Deleted' }],
      language: [{ id: languageEnums.ENGLISH, name: 'English' }, { id: languageEnums.ARABIC, name: 'Arabic' }],
      gender: [{ id: genderEnums.MALE, name: language === languageEnums.ARABIC ? 'ذكر' : 'Male' }, { id: genderEnums.FEMALE, name: language === languageEnums.ARABIC ? 'انثى' : 'Female' }],
      id_types: id_types.status === 'fulfilled' ? id_types.value.map(item => ({ id: item.id, name: item[`${language}_name`] })) : [],
      countries: countries.status === 'fulfilled' ? countries.value.map(item => ({ id: item.id, name: item[`${language}_name`], nationality: item[`${language}_nationality`], country_code: item.country_code, phone_code: item.phone_code })) : [],
    };
  }

}
