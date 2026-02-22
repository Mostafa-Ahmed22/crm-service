import { IsInt, IsString, IsNotEmpty, ValidateNested, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOwnershipTypeDto {
  @IsString()
  @IsNotEmpty()
  en_name: string;

  @IsString()
  @IsNotEmpty()
  ar_name: string;  
}

export class CreateOwnershipTypesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOwnershipTypeDto)
  ownership_types: CreateOwnershipTypeDto[];
}
