import { IsInt, IsString, IsNotEmpty, ValidateNested, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCountryDto {
  @IsString()
  @IsNotEmpty()
  en_name: string;

  @IsString()
  @IsNotEmpty()
  ar_name: string;  

  @IsString()
  @IsNotEmpty()
  en_nationality: string;

  @IsString()
  @IsNotEmpty()
  ar_nationality: string;
  
  @IsString()
  @IsNotEmpty()
  country_code: string;
  
  @IsString()
  @IsNotEmpty()
  phone_code: string;
}

export class CreateCountriesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCountryDto)
  countries: CreateCountryDto[];
}
