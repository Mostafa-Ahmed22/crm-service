import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  en_name: string;
  
  @IsString()
  ar_name: string;

  @IsNumber()
  @IsOptional()
  company_project_id: number;

  @IsNumber()
  @IsOptional()
  is_deleted: number;

}