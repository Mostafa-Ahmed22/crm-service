import {
  IsInt,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class AssignUnitToCustomerDto {
  @IsInt()
  customer_id: number;

  @IsInt()
  unit_id: number;

  @IsInt()
  @IsOptional()
  project_id: number;

  @IsDateString()
  start_date: string;

  @IsDateString()
  sign_date: string;

  @IsDateString()
  @IsOptional()
  end_date: string;

  @IsInt()
  ownership_id: number;

  @IsString()
  contract_number: string;

  @IsInt()
  @IsOptional()
  is_active?: number;
}