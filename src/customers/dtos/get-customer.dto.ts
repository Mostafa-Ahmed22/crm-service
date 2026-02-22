import { Expose, Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class GetCustomersDto {
  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  @Type(() => Number)
  id: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  customer_name: string;
  
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  sap_customer_id: string;
  // @Expose({ name: 'sap_customer_id' })
  // customer_code: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  id_number: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  mobile_number: string;

  @IsString()
  @IsOptional()
  page: string;

  @IsString()
  @IsOptional()
  limit: string;

}