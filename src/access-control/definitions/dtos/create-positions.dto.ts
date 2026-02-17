import { IsInt, IsString, IsNotEmpty, ValidateNested, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PositionDto {
  @IsString()
  @IsNotEmpty()
  en_name: string;

  @IsString()
  @IsNotEmpty()
  ar_name: string;  

  @IsInt()
  @IsOptional()
  @IsNotEmpty()
  project_id: number;
}

export class CreatePositionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PositionDto)
  positions: PositionDto[];
}
