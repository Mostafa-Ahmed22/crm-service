import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from 'src/generated/postgres/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoleDto } from './dtos/create-role.dto';
import { activeStatusEnums, isDeleteStatusEnums, superAdminEnums } from 'src/common/enums/shared.enum';
import { UpdateRoleDto } from './dtos/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

    async createRole(data: CreateRoleDto, user: any) {
    let { en_name, ar_name, company_project_id } = data;

    if (!company_project_id) {
      company_project_id = user.company_project_id
    }
    try {
      const role = await this.prisma.roles.create({ data: { en_name, ar_name, company_project_id, created_by: user.user_name } });
      if (!role) {
        throw new InternalServerErrorException('Failed to create role');
      }
      return {id : role.id, message : 'Role created successfully'};
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

    async getRoles(language: string, user: any, pagination: { page: number, limit: number, skip: number }, filter: string) {

    const userRoleName = user.role_name;
    // fix sign with dto
    let company_project_id: any;
    company_project_id = +user.company_project_id;

    const roles = await this.prisma.roles.findMany({
      where: {
        created_by: { not: null }, [`${language}_name`]: { contains : filter, mode: 'insensitive'},
        ...(userRoleName !== superAdminEnums.ROLE_EN_NAME ? { company_project_id: company_project_id } : {})
      },
      skip: pagination.skip,
      take: pagination.limit,
    });


     // Get total count for pagination metadata
    const totalCount = await this.prisma.roles.count({
      where: {
        created_by: { not: null },
        [`${language}_name`]: { contains: filter, mode: 'insensitive' },
        ...(userRoleName !== superAdminEnums.ROLE_EN_NAME 
          ? { company_project_id: company_project_id } 
          : {})
      }
    });

    // Transform into [{id, name}]
    const result: { id: string; name: string }[] = roles.map(r => { return { id: r.id, name: r[`${language}_name`] } });

    return {
      totalCount,
      totalPages: Math.ceil(totalCount / pagination.limit),
      roles: result
    };
  }

  async updateRole(id: string, data: UpdateRoleDto) {
    try {
      const updatedRole = await this.prisma.roles.update({
        where: { id },
        data,
      });
      return { id: updatedRole.id, message: 'Role updated successfully' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(`Role with name "${data.en_name}" already exists`);
        }
        if (error.code === 'P2003') {
          throw new BadRequestException('Invalid foreign key reference');
        }
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException('Invalid data provided');
      }
      throw new InternalServerErrorException('Failed to update role');
    }
  }

  async assignPrivilegeToRole(data: { privileges: { role_id: string, menuitem_id: number, privilege_id: number, status: number }[] }) {    
    try {
      const results = await Promise.all(
        data.privileges.map((privilege) =>
          this.prisma.role_privileges.upsert({
            where: {
              role_id_menuitem_id_privilege_id: {
                role_id: privilege.role_id,
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
  async getRolePrivileges(role_id: string, language: 'en' | 'ar') {

    const privileges = await this.prisma.role_privileges.findMany({
      where: { role_id, status: activeStatusEnums.ACTIVE, roles : { is_deleted: isDeleteStatusEnums.NOT_DELETED},
        privileges : {is_deleted: isDeleteStatusEnums.NOT_DELETED},
        menuItems : {is_deleted: isDeleteStatusEnums.NOT_DELETED,
          menu: {is_deleted: isDeleteStatusEnums.NOT_DELETED}
        },
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

}
