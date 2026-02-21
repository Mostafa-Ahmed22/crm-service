import { IsInt, IsString, IsNotEmpty, ValidateNested, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UnitTypeDto {
  @IsString()
  @IsNotEmpty()
  en_name: string;

  @IsString()
  @IsNotEmpty()
  ar_name: string;  

  @IsInt()
  @IsOptional()
  @IsNotEmpty()
  project_id: number;
}

export class CreateUnitTypesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UnitTypeDto)
  unit_types: UnitTypeDto[];
}
