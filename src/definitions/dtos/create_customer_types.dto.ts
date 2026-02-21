import { IsInt, IsString, IsNotEmpty, ValidateNested, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCustomerTypeDto {
  @IsString()
  @IsNotEmpty()
  en_name: string;

  @IsString()
  @IsNotEmpty()
  ar_name: string;  
}

export class CreateCustomerTypesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCustomerTypeDto)
  customer_types: CreateCustomerTypeDto[];
}
