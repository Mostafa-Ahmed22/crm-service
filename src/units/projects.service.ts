import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { activeStatusEnums, genderEnums, isDeleteStatusEnums, languageEnums, projectEnums, promiseStatusEnums, superAdminEnums } from 'src/common/enums/shared.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'src/generated/postgres/prisma/client';
import * as dtos from './dtos/index.dto';
import { HelperService } from 'src/helper/helper.service';
import type * as interfaces from 'src/common/interfaces/index.interfaces';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService
  ) { }

 
  async createUnit(user: interfaces.User, data: dtos.CreateUnitDto) {
    try {
      const { unit_specifications, ...unitData } = data
      // create unit specifications
      const unitSpecifications = await this.prisma.unit_specifications.create({ data: { ...data.unit_specifications } });

      if (!unitSpecifications)
        throw new BadRequestException("Failed to create unit specifications");
      // create unit
      const unit = await this.prisma.units.create({
        data: {
          ...unitData,
          project_id: data.project_id ? data.project_id : user.company_project_id,
          created_by: user.employee_id,
          unlock_date: unitData.unlock_date ? new Date(unitData.unlock_date) : null,
          lock_date: unitData.lock_date ? new Date(unitData.lock_date) : null,
          contracting_date: unitData.contracting_date ? new Date(unitData.contracting_date) : null,
          delivery_date: unitData.delivery_date ? new Date(unitData.delivery_date) : null,
          unit_specification_id: unitSpecifications.id
        }
      });
      if (!unit) {
        // Rollback unit specifications if unit creation fails
        await this.prisma.unit_specifications.delete({ where: { id: unitSpecifications.id } });
        throw new BadRequestException("Failed to create unit");
      }
      return { unit_id: unit.id, message: "Unit created successfully" };

    } catch (error) {
      console.log("error ===> ", error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === "P2002") {
          throw new ConflictException(`Unit name already exists`);
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

  async getUnits(user: interfaces.User, pagination: interfaces.Pagination, language: string, filter: string) {
    const units = await this.prisma.units.findMany({
      where: {
        project_id: user.company_project_id, unit_number: { contains: filter, mode: 'insensitive' }
      },
      include: {
        unit_specifications: {
          include: {
            unit_types: { select: { id: true, [`${language}_name`]: true } },
            locations: { select: { id: true, [`${language}_name`]: true } }
          }
        },
        company_project: { select: { id: true, [`${language}_name`]: true } },
        employees_units_created_byToemployees: { select: { id: true, full_name: true } },
        employees_units_updated_byToemployees: { select: { id: true, full_name: true } },
        employees_units_locked_byToemployees: { select: { id: true, full_name: true } },
        employees_units_unlocked_byToemployees: { select: { id: true, full_name: true } },
      },
      skip: pagination.skip,
      take: pagination.limit,
    });
    // Get total count for pagination metadata
    const totalCount = await this.prisma.units.count({
      where: {
        project_id: user.company_project_id, unit_number: { contains: filter, mode: 'insensitive' }
      }
    });
    // Format response
    const formattedUnits = units.map(unit => {
      const { unit_specifications: { unit_types, locations, ...unit_specifications }, company_project,
        employees_units_created_byToemployees, employees_units_updated_byToemployees,
        employees_units_locked_byToemployees, employees_units_unlocked_byToemployees, ...unitRest } = unit
      return {
        ...unitRest,
        project_name: company_project[`${language}_name`],
        unit_specifications: {
          ...unit_specifications,
          unit_type_id: unit_types.id,
          unit_type_name: unit_types[`${language}_name`],
          location_id: locations.id,
          location_name: locations[`${language}_name`]
        },
        created_by_id: employees_units_created_byToemployees?.id,
        created_by: employees_units_created_byToemployees?.full_name,
        updated_by_id: employees_units_updated_byToemployees?.id,
        updated_by: employees_units_updated_byToemployees?.full_name,
        locked_by_id: employees_units_locked_byToemployees?.id,
        locked_by: employees_units_locked_byToemployees?.full_name,
        unlocked_by_id: employees_units_unlocked_byToemployees?.id,
        unlocked_by: employees_units_unlocked_byToemployees?.full_name,
      }
    });

    return {
      totalCount,
      totalPages: Math.ceil(totalCount / pagination.limit),
      currentPage: pagination.page,
      units: formattedUnits
    };
  }

  async getProjectUnit(project_id: number, language: string, unitNumber: string) {
    const units = await this.prisma.units.findMany({
      where: {
        project_id, unit_number: { equals: unitNumber, mode: 'insensitive' }
      },
      include: {
        unit_specifications: {
          include: {
            unit_types: { select: { id: true, [`${language}_name`]: true } },
            locations: { select: { id: true, [`${language}_name`]: true } }
          }
        },
        company_project: { select: { id: true, [`${language}_name`]: true } },
        employees_units_created_byToemployees: { select: { id: true, full_name: true } },
        employees_units_updated_byToemployees: { select: { id: true, full_name: true } },
        employees_units_locked_byToemployees: { select: { id: true, full_name: true } },
        employees_units_unlocked_byToemployees: { select: { id: true, full_name: true } },
      }
    });
    // Get total count for pagination metadata
    const totalCount = await this.prisma.units.count({
      where: {
        project_id, unit_number: { equals: unitNumber, mode: 'insensitive' }
      }
    });
    // Format response
    const formattedUnits = units.map(unit => {
      const { unit_specifications: { unit_types, locations, ...unit_specifications }, company_project,
        employees_units_created_byToemployees, employees_units_updated_byToemployees,
        employees_units_locked_byToemployees, employees_units_unlocked_byToemployees, ...unitRest } = unit
      return {
        ...unitRest,
        project_name: company_project[`${language}_name`],
        unit_specifications: {
          ...unit_specifications,
          unit_type_id: unit_types.id,
          unit_type_name: unit_types[`${language}_name`],
          location_id: locations.id,
          location_name: locations[`${language}_name`]
        },
        created_by_id: employees_units_created_byToemployees?.id,
        created_by: employees_units_created_byToemployees?.full_name,
        updated_by_id: employees_units_updated_byToemployees?.id,
        updated_by: employees_units_updated_byToemployees?.full_name,
        locked_by_id: employees_units_locked_byToemployees?.id,
        locked_by: employees_units_locked_byToemployees?.full_name,
        unlocked_by_id: employees_units_unlocked_byToemployees?.id,
        unlocked_by: employees_units_unlocked_byToemployees?.full_name,
      }
    });

    return {
      units: formattedUnits
    };
  }

  async checkIfProjectInPublic(project_id: number): Promise<void> {
    if (project_id === projectEnums.ALL_PROJECTS)
      throw new BadRequestException("Invalid project ID");
    try {
      const checkProject = await this.prisma.company_project.findUnique({ where: { id: project_id } });
      if (!checkProject) throw new BadRequestException("Invalid project ID");
      return;
    } catch (error) {
      throw new BadRequestException("Invalid project ID");
    }
  }

  async getProjects(language: string) {
    const projects = await this.prisma.company_project.findMany({
      where: { id: { not: projectEnums.ALL_PROJECTS } },
      select: { id: true, [`${language}_name`]: true }
    });
    return projects.map(project => ({ id: project.id, name: project[`${language}_name`] }));
  }
}
