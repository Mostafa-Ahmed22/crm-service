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

  async getUnits(user: interfaces.User, pagination: interfaces.Pagination, language: string, filter: dtos.GetUnitsDto) {
    const { unit_specifications, ...unitData } = filter
    const whereClause: Prisma.unitsWhereInput = {
      project_id: unitData.project_id ? unitData.project_id : user.company_project_id,
      unit_number: unitData.unit_number ? { contains: unitData.unit_number, mode: 'insensitive' } : undefined,
      is_active: unitData.is_active ? unitData.is_active : undefined,
      unit_specifications: {
        unit_type_id: unit_specifications?.unit_type_id ? unit_specifications.unit_type_id : undefined,
        is_furnished: unit_specifications?.is_furnished ? unit_specifications.is_furnished : undefined,
      }
    };

    const units = await this.prisma.units.findMany({
      where: whereClause,
      include: {
        unit_specifications: {
          include: {
            unit_types: { select: { id: true, [`${language}_name`]: true } },
            locations: { include: { locations: true } },
          }
        },
        customer_units: {
          include: {
            customers: {
              include: {
                customer_types: { select: { id: true, [`${language}_name`]: true } },
                marital_statuses: { select: { id: true, [`${language}_name`]: true } },
                religions: { select: { id: true, [`${language}_name`]: true } },
                countries: { select: { id: true, [`${language}_name`]: true } },
                id_types: { select: { id: true, [`${language}_name`]: true } },
              }
            },
            ownership_types: { select: { id: true, [`${language}_name`]: true } }
          }
        },
        company_project: { select: { id: true, [`${language}_name`]: true } },
      },
      skip: pagination.skip,
      take: pagination.limit,
    });
    // Get total count for pagination metadata
    const totalCount = await this.prisma.units.count({ where: whereClause });
    // Format response
    const formattedUnits = units.map(unit => {
      const { unit_specifications: { unit_types, locations, ...unit_specifications }, customer_units, company_project, ...unitRest } = unit
      return {
        ...unitRest,
        project_name: company_project[`${language}_name`],
        unit_specifications: {
          ...unit_specifications,
          unit_type_id: unit_types.id,
          unit_type_name: unit_types[`${language}_name`],
          locations : this.helperService.buildLocationHierarchyFromFlat(locations, language)
        },
        customer_units: customer_units.map(customer_unit => ({
          customer_id: customer_unit.customers.id,
          mobile_number: customer_unit.customers.mobile_number,
          customer_name: customer_unit.customers.customer_name,
          customer_type_id: customer_unit.customers.customer_types.id,
          customer_type_name: customer_unit.customers.customer_types[`${language}_name`],
          marital_status_id: customer_unit.customers.marital_statuses.id,
          marital_status_name: customer_unit.customers.marital_statuses[`${language}_name`],
          religion_id: customer_unit.customers.religions.id,
          religion_name: customer_unit.customers.religions[`${language}_name`],
          country_id: customer_unit.customers.countries.id,
          country_name: customer_unit.customers.countries[`${language}_name`],
          id_type_id: customer_unit.customers.id_types.id,
          id_type_name: customer_unit.customers.id_types[`${language}_name`],
          ownership_type_id: customer_unit.ownership_types.id,
          ownership_type_name: customer_unit.ownership_types[`${language}_name`],
          sign_date: customer_unit.sign_date,
          contract_number: customer_unit.contract_number,

        }))
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
            locations: { include: { locations: true } },
          }
        },
        customer_units: {
          include: {
            customers: {
              include: {
                customer_types: { select: { id: true, [`${language}_name`]: true } },
                marital_statuses: { select: { id: true, [`${language}_name`]: true } },
                religions: { select: { id: true, [`${language}_name`]: true } },
                countries: { select: { id: true, [`${language}_name`]: true } },
                id_types: { select: { id: true, [`${language}_name`]: true } },
              }
            },
            ownership_types: { select: { id: true, [`${language}_name`]: true } }
          }
        },
        company_project: { select: { id: true, [`${language}_name`]: true } },
      },
    });

    // Format response
    const formattedUnits = units.map(unit => {
      const { unit_specifications: { unit_types, locations, ...unit_specifications }, customer_units, company_project, ...unitRest } = unit
      return {
        ...unitRest,
        project_name: company_project[`${language}_name`],
        unit_specifications: {
          ...unit_specifications,
          unit_type_id: unit_types.id,
          unit_type_name: unit_types[`${language}_name`],
          locations : this.helperService.buildLocationHierarchyFromFlat(locations, language)
        },
        customer_units: customer_units.map(customer_unit => ({
          customer_id: customer_unit.customers.id,
          mobile_number: customer_unit.customers.mobile_number,
          customer_name: customer_unit.customers.customer_name,
          customer_type_id: customer_unit.customers.customer_types.id,
          customer_type_name: customer_unit.customers.customer_types[`${language}_name`],
          marital_status_id: customer_unit.customers.marital_statuses.id,
          marital_status_name: customer_unit.customers.marital_statuses[`${language}_name`],
          religion_id: customer_unit.customers.religions.id,
          religion_name: customer_unit.customers.religions[`${language}_name`],
          country_id: customer_unit.customers.countries.id,
          country_name: customer_unit.customers.countries[`${language}_name`],
          id_type_id: customer_unit.customers.id_types.id,
          id_type_name: customer_unit.customers.id_types[`${language}_name`],
          ownership_type_id: customer_unit.ownership_types.id,
          ownership_type_name: customer_unit.ownership_types[`${language}_name`],
          sign_date: customer_unit.sign_date,
          contract_number: customer_unit.contract_number,

        }))
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
  async getCompanyCodes(language: string, projectId: number) {
    const projects = await this.prisma.company_project.findMany({
      where: { AND: [{ id: projectId }, { id: { not: projectEnums.ALL_PROJECTS } }] },
      select: { id: true, [`${language}_name`]: true, company_code: true, project_code: true }
    });
    if (!projects || !projects.length ) throw new BadRequestException("No Company projects found");
    // const companyProjects = {}
    // projects.forEach(project => {
    //   if (!companyProjects[`${project.id}`]) {
    //     companyProjects[`${project.id}`] = { id: project.id, name: project[`${language}_name`], company_code: project.company_code, project_codes: [] }
    //   }
    //   companyProjects[`${project.id}`].project_codes.push({ id: project.id, name: project[`${language}_name`], project_code: project.project_code })
    // }) 
    const formattedProjects = projects.map(project => ({
      id: project.id,
      name: project[`${language}_name`],
      company_code: project.company_code,
      project_code: project.project_code
    }))
    return formattedProjects;
  }
}
