import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max
} from 'class-validator';

export

  class CreateServiceConfigDto {
  @IsInt()
  @IsOptional()
  technical_staff_count: number;

  @IsString()
  @IsOptional()
  SLA: string;

  @IsString()
  @IsOptional()
  delay: string;


  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(1)
  is_active: number; // defaults to 1

  @IsInt()
  @IsOptional()
  project_id: number; // defaults to 1

}