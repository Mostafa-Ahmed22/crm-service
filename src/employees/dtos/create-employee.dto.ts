import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, IsInt, Length } from 'class-validator';

export class CreateEmployeeDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  user_name: string;

  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsOptional()
  @IsString()
  @Length(7, 15) // typical phone length
  phone_number?: string;

  @IsInt()
  is_male: number; // 1 or 0, depending on your convention

  @IsOptional()
  @IsUUID()
  role_id?: string;

  @IsOptional()
  @IsInt()
  department_id?: number;

  @IsInt()
  position_id: number;

  @IsOptional()
  @IsInt()
  safe_id?: number;

  @IsOptional()
  @IsInt()
  user_type_id?: number;
}