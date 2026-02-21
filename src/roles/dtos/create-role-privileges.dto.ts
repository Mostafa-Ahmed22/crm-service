import { IsString, IsNotEmpty, ValidateNested, IsArray, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRolePrivilegeDto {
  
  @IsString()
  @IsNotEmpty()
  role_id: string;

  @IsInt()
  @IsNotEmpty()
  menuitem_id: number;  

  @IsInt()
  @IsNotEmpty()
  privilege_id: number;  

  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  status: number;  

}

export class CreateRolePrivilegesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRolePrivilegeDto)
  privileges: CreateRolePrivilegeDto[];
}
