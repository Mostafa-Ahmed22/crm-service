import {
  IsInt,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsDateString,
  IsEmail,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  customer_name: string;

  @IsInt()
  country_id: number;

  @IsInt()
  id_type: number;

  @IsString()
  @IsNotEmpty()
  id_number: string;

  @IsOptional()
  @IsString()
  mobile_number?: string;

  @IsOptional()
  @IsString()
  telephone_number?: string;

  @IsOptional()
  @IsString()
  address_one?: string;

  @IsOptional()
  @IsString()
  address_two?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsInt()
  marital_status_id: number;

  @IsInt()
  religion_id: number;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  emergency_contact?: string;

  @IsOptional()
  @IsString()
  emergency_contact_relation?: string;

  @IsOptional()
  @IsString()
  emergency_contact_phone_number?: string;

  @IsInt()
  customer_type_id: number; // FK to customer_types

  @IsInt()
  @IsOptional()
  project_id?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  is_active?: number;

  @IsOptional()
  @IsInt()
  is_deleted?: number;

  @IsString()
  @IsNotEmpty()
  sap_customer_id: string;

  @IsOptional()
  @IsDateString()
  birth_date?: string;
}