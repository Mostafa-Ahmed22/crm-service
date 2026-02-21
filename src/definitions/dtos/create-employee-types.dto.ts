import { IsInt, IsString, IsNotEmpty, ValidateNested, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class EmployeeTypesTypeDto {
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

export class CreateEmployeeTypesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmployeeTypesTypeDto)
  employee_types: EmployeeTypesTypeDto[];
}
