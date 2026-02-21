import { IsInt, IsString, IsNotEmpty, ValidateNested, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReligionDto {
  @IsString()
  @IsNotEmpty()
  en_name: string;

  @IsString()
  @IsNotEmpty()
  ar_name: string;  
}

export class CreateReligionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReligionDto)
  religions: CreateReligionDto[];
}
