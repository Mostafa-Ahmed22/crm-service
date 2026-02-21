import { IsInt, IsString, IsNotEmpty, ValidateNested, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMaritalStatusDto {
  @IsString()
  @IsNotEmpty()
  en_name: string;

  @IsString()
  @IsNotEmpty()
  ar_name: string;  
}

export class CreateMaritalStatusesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMaritalStatusDto)
  marital_statuses: CreateMaritalStatusDto[];
}
