import { IsInt, IsString, IsNotEmpty, ValidateNested, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateIDTypeDto {
  @IsString()
  @IsNotEmpty()
  en_name: string;

  @IsString()
  @IsNotEmpty()
  ar_name: string;  
}

export class CreateIDTypesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIDTypeDto)
  id_types: CreateIDTypeDto[];
}
