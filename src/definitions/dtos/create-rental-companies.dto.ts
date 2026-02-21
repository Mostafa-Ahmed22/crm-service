import { IsInt, IsString, IsNotEmpty, ValidateNested, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class RentalCompanyDto {
  @IsString()
  @IsNotEmpty()
  en_name: string;

  @IsString()
  @IsNotEmpty()
  ar_name: string;  

  @IsString()
  @IsNotEmpty()
  rental_company_code: string;

  @IsInt()
  @IsOptional()
  @IsNotEmpty()
  project_id: number;
}

export class CreateRentalCompaniesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RentalCompanyDto)
  rental_companies: RentalCompanyDto[];
}
