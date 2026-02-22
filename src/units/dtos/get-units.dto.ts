import { Expose, Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsDateString,
  ValidateNested,
  IsObject,
  IsNumber,
} from 'class-validator';


class GetUnitSpecificationDto {
  @IsInt()
  @IsOptional()
  unit_type_id: number;

  @IsInt()
  @IsOptional()
  is_furnished: number;
}

export class GetUnitsDto {

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  unit_number: string;

  @IsInt()
  @IsOptional()
  project_id: number;
  
  @IsInt()
  @IsOptional()
  is_active: number;

  @IsDateString()
  @IsOptional()
  delivery_date?: string;

    // unit_specifications nested object
  @IsObject()
  @ValidateNested()
  @IsOptional()
  @Type(() => GetUnitSpecificationDto)
  unit_specifications: GetUnitSpecificationDto;

  @IsString()
  @IsOptional()
  page: string;

  @IsString()
  @IsOptional()
  limit: string;
}