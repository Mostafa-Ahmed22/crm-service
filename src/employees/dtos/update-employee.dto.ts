import { IsOptional, IsString, IsUUID, IsInt, Length } from 'class-validator';

export class UpdateEmployeeDto {

  @IsString()
  @IsOptional()
  full_name?: string;

  @IsOptional()
  @IsString()
  @Length(7, 15) // typical phone length
  phone_number?: string;

  @IsInt()
  @IsOptional()
  is_male?: number; // 1 or 0, depending on your convention

  @IsOptional()
  @IsUUID()
  role_id?: string;

  @IsOptional()
  @IsInt()
  department_id?: number;

  @IsInt()
  @IsOptional()
  position_id?: number;

  @IsOptional()
  @IsInt()
  safe_id?: number;

  @IsOptional()
  @IsInt()
  employee_type_id?: number;

  @IsOptional()
  @IsInt()
  is_locked?: number;

  @IsOptional()
  @IsInt()
  is_deleted?: number;

  @IsOptional()
  @IsString()
  manager_id?: string;
}