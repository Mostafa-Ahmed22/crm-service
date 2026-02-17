import { IsString, IsNotEmpty, ValidateNested, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSafeDto {
  @IsString()
  @IsNotEmpty()
  en_name: string;

  @IsString()
  @IsNotEmpty()
  ar_name: string;  

  @IsInt()
  @IsNotEmpty()
  project_id: number;
}
