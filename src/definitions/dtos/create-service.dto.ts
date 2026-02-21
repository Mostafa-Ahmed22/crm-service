import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsInt,
  Min,
  Max,
  IsNumber,
  Matches
} from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  en_name: string;

  @IsString()
  @IsNotEmpty()
  ar_name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsNotEmpty()
  department_id: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(1)
  is_active?: number; // defaults to 1

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(1)
  show_in_mobile?: number; // defaults to 1

  @IsString()
  @IsOptional()
  en_mobile_service_name?: string;

  @IsString()
  @IsOptional()
  ar_mobile_service_name?: string;

  @IsInt()
  @IsOptional()
  service_config_id?: number;

  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'start_date must be in YYYY-MM-DD format'
  })
  start_date?: string;

}