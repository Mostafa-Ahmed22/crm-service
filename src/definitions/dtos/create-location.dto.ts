import { IsInt, IsString, IsNotEmpty, ValidateNested, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class LocationDto {
  @IsString()
  @IsNotEmpty()
  en_name: string;

  @IsString()
  @IsNotEmpty()
  ar_name: string;

  @IsInt()
  @IsNotEmpty()
  location_type_id: number;

  @IsInt()
  @IsOptional()
  @IsNotEmpty()
  project_id: number;

  @IsInt()
  @IsOptional()
  @IsNotEmpty()
  parent_location_id: number;


  @IsString()
  @IsOptional()
  @IsNotEmpty()
  location_code: string;
}

export class CreateLocationsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationDto)
  locations: LocationDto[];
}
