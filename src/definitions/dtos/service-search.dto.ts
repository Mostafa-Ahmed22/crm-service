import { Type } from 'class-transformer';
import { IsString, IsOptional, IsIn, IsInt } from 'class-validator';

export class ServiceSearchDto {
  @IsString()
  @IsOptional()
  @Type(() => Number)
  service_id: number;
  
  @IsString()
  @IsOptional()
  service_name: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  department_id: number;

  @IsString()
  @IsOptional()
  @Type(() => Number)
  is_active: number;

  @IsString()
  @IsOptional()
  @Type(() => Number)
  show_in_mobile: number;

  @IsString()
  @IsOptional()
  start_date: string;
  

  @IsString()
  @IsOptional()
  page: string;

  @IsString()
  @IsOptional()
  limit: string;

}