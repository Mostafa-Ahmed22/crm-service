import {
  IsInt,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateUnitSpecificationDto {
  @IsInt()
  unit_type_id: number;

  @IsInt()
  location_id: number;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  total_area: number;

  @IsInt()
  @IsOptional()
  floor: number;

  @IsInt()
  @IsOptional()
  room_no: number;

  @IsInt()
  @IsOptional()
  path_room_no: number;

  @IsInt()
  @IsOptional()
  living_room_no: number;

  @IsInt()
  @IsOptional()
  balcony_no: number;

  @IsInt()
  is_furnished: number;
}

export class CreateUnitDto {

  @IsString()
  unit_number: string;

  @IsInt()
  @IsOptional()
  project_id: number;
  
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  notes?: string;

  @IsInt()
  is_active: number;

  @IsInt()
  is_broker: number;

  @IsOptional()
  @IsDateString()
  delivery_date?: string;

  @IsOptional()
  @IsDateString()
  contracting_date?: string;

  @IsOptional()
  @IsString()
  created_by?: string;

  @IsOptional()
  @IsString()
  updated_by?: string;

  @IsInt()
  is_eligible_for_rent: number;

  @IsInt()
  is_locked: number;

  @IsOptional()
  @IsDateString()
  lock_date?: string;

  @IsOptional()
  @IsString()
  locked_by?: string;

  @IsOptional()
  @IsDateString()
  unlock_date?: string;

  @IsOptional()
  @IsString()
  unlocked_by?: string;

    // unit_specifications nested object
  @IsObject()
  @ValidateNested()
  @Type(() => CreateUnitSpecificationDto)
  unit_specifications: CreateUnitSpecificationDto;

}