import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import * as dtos from './dtos/index.dto';
import { HelperService } from 'src/helper/helper.service';
import { PrismaService } from 'src/prisma/prisma.service';
import type { User } from 'src/common/interfaces/user-request.interface';
import { Prisma } from 'src/generated/postgres/prisma/client';

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
}
