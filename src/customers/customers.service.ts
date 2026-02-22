import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { HelperService } from 'src/helper/helper.service';
import { PrismaService } from 'src/prisma/prisma.service';
import type { User } from 'src/common/interfaces/user-request.interface';
import { Prisma } from 'src/generated/postgres/prisma/client';
import * as dtos from './dtos/index.dto';
import type * as interfaces from 'src/common/interfaces/index.interfaces';
import { isDeleteStatusEnums } from 'src/common/enums/shared.enum';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService
  ) { }
  async createCustomer(user: User, createCustomerDto: dtos.CreateCustomerDto) {
    try {

      const customer = await this.prisma.customers.create({
        data: {
          ...createCustomerDto,
          project_id: createCustomerDto.project_id ? createCustomerDto.project_id : user.company_project_id,
          ...(createCustomerDto.birth_date && { birth_date: new Date(createCustomerDto.birth_date) }),
          created_by: user.employee_id
        },
      });
      if (!customer) throw new BadRequestException("Failed to create customer");
      return customer;
    } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Unique constraint violation
            if (error.code === "P2002") {
              throw new ConflictException(`Customer with the provided details already exists`);
            }
            // Foreign key constraint failed
            if (error.code === "P2003") {
              throw new BadRequestException("Invalid foreign key reference");
            }
          } else if (error instanceof Prisma.PrismaClientValidationError) {
            throw new BadRequestException(`Invalid data provided: ${error.message}`);
          }
        }
  }

  async getCustomers(user: User, language: string, pagination: interfaces.Pagination, query: dtos.GetCustomersDto) {
    const whereClause: Prisma.customersWhereInput = {
      id: query.id,
      sap_customer_id: query.sap_customer_id,
      id_number: query.id_number,
      is_deleted: isDeleteStatusEnums.NOT_DELETED,
      project_id: user.company_project_id,
      ...(query.customer_name && { customer_name: { contains: query.customer_name, mode: 'insensitive' } }),
      ...(query.mobile_number && { mobile_number: { contains: query.mobile_number, mode: 'insensitive' } }),
    };
    const includeClause : Prisma.customersInclude = {
      customer_units: {
        include: {
          units: {
            include: {
              unit_specifications: {
                include: {
                  unit_types: { select: { id: true, [`${language}_name`]: true } },
                  locations: { include: { locations: true } }
                }
              }
            },
          },
          ownership_types: { select: { id: true, [`${language}_name`]: true } },
          
        }
      },
      company_project: { select: { id: true, [`${language}_name`]: true } },
      customer_types: { select: { id: true, [`${language}_name`]: true } },
      marital_statuses: { select: { id: true, [`${language}_name`]: true } },
      religions: { select: { id: true, [`${language}_name`]: true } },
      countries: { select: { id: true, [`${language}_name`]: true } },
      id_types: { select: { id: true, [`${language}_name`]: true } },
      
    };

    
    const customers = await this.prisma.customers.findMany({
      where: whereClause,
      orderBy: {
        id: 'desc',
      },
      include: includeClause,
      skip: pagination.skip,
      take: pagination.limit
    });

    const totalCount = await this.prisma.customers.count({
      where: whereClause,
    });

    const formattedCustomers = customers.map(customer => {
      const { customer_units, company_project, customer_types, marital_statuses, religions, countries, id_types, ...customerRest }:any = customer;
      const customerData:any = {...customerRest}
      customerData.project_name = company_project ? company_project[`${language}_name`] : null;
      customerData.customer_type_name = customer_types ? customer_types[`${language}_name`] : null;
      customerData.marital_status_name = marital_statuses ? marital_statuses[`${language}_name`] : null;
      customerData.religion_name = religions ? religions[`${language}_name`] : null;
      customerData.country_name = countries ? countries[`${language}_name`] : null;
      customerData.id_type_name = id_types ? id_types[`${language}_name`] : null;
      // locations : this.helperService.buildLocationHierarchyFromFlat(locations, language)
      
      customerData.customer_units =  customer_units.map(cu => {
        
        const {start_date, sign_date, end_date, contract_number, is_active, is_deleted, ownership_id, ownership_types, units} = cu
        const unitsData:any = {start_date, sign_date, end_date, contract_number, is_active, is_deleted, ownership_id, ownership: ownership_types[`${language}_name`] }

        const { unit_specifications: { unit_types, locations, ...unit_specifications } , ...unitRest } = units;
        unitsData.unit_details = {
          ...unitRest,
          project_name: company_project[`${language}_name`],
          unit_specifications: {
            ...unit_specifications,
            unit_type_id: unit_types.id,
            unit_type_name: unit_types[`${language}_name`],
            locations : this.helperService.buildLocationHierarchyFromFlat(locations, language)
          },
        }

        return unitsData;

        console.log("unitsData ========> ", unitsData);
      })
      return customerData;
    });
    return {
      totalCount,
      totalPages: Math.ceil(totalCount / pagination.limit),
      customers: formattedCustomers
    };
  }

  async assignUnitToCustomer(user: User, body: dtos.AssignUnitToCustomerDto) {
    try {
      const assignment = await this.prisma.customer_units.create({
        data: {
          ...body,
          project_id: body.project_id ? body.project_id : user.company_project_id,
          created_by: user.employee_id,
          ...( body.start_date && { start_date: new Date(body.start_date) } ),
          ...( body.sign_date && { sign_date: new Date(body.sign_date) } ),
          ...( body.end_date && { end_date: new Date(body.end_date), is_active: 0 } ),
          ...( !body.end_date && !body.is_active && { is_active: 1 } )
        },
      });
      if (!assignment) throw new BadRequestException("Failed to create assignment");
      return assignment;
    } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Unique constraint violation
            if (error.code === "P2002") {
              throw new ConflictException(`Assignment with the provided details already exists`);
            }
            // Foreign key constraint failed
            if (error.code === "P2003") {
              throw new BadRequestException("Invalid foreign key reference");
            }
          } else if (error instanceof Prisma.PrismaClientValidationError) {
            throw new BadRequestException(`Invalid data provided: ${error.message}`);
          }
        }
  }

  async getCustomerByMobile(language: string, mobileNumber: string) {
    const customer = await this.prisma.customers.findMany({
      where: {
        mobile_number: mobileNumber,
      },
      include: {
        company_project: { select: { [`${language}_name`]: true } },
        customer_types: { select: { [`${language}_name`]: true } },
        marital_statuses: { select: { [`${language}_name`]: true } },
        religions: { select: { [`${language}_name`]: true } },
        countries: { select: { [`${language}_name`]: true } },
        id_types: { select: { [`${language}_name`]: true } },
        customer_units: {
          include: { units: true, ownership_types: { select: { [`${language}_name`]: true } } }
        },
      },
    });
    if (!customer || customer.length === 0) throw new BadRequestException("Customer with the provided mobile number does not exist");
    const formattedCustomer = customer.map(c => {
      const { customer_units, company_project, customer_types, marital_statuses, religions, countries, id_types, ...customerRest }:any = c;
      const customerData:any = {...customerRest}

      customerData.customer_type_name = customer_types ? customer_types[`${language}_name`] : null;
      customerData.marital_status_name = marital_statuses ? marital_statuses[`${language}_name`] : null;
      customerData.religion_name = religions ? religions[`${language}_name`] : null;
      customerData.country_name = countries ? countries[`${language}_name`] : null;
      customerData.id_type_name = id_types ? id_types[`${language}_name`] : null;
      customerData.customer_unit = customer_units.map(cu => {
        const { ownership_types, units, ...cuRest } = cu;
        return {
          project_id: cu.project_id,
          project_name: company_project ? company_project[`${language}_name`] : null,
          unit_number: units.unit_number,
          ownership_type_name: ownership_types ? ownership_types[`${language}_name`] : null
        };
      })
      return customerData;
    })
    return formattedCustomer;
  }

}
