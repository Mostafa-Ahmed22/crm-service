import { Type } from 'class-transformer';
import { IsString, IsOptional, IsIn, IsInt } from 'class-validator';

export class ServiceSearchDto {
  @IsInt()
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

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  is_active: number;

  @IsInt()
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