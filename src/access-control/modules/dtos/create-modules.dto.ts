import { IsInt, IsString, IsNotEmpty, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class ModuleItemDto {
  @IsInt()
  @IsNotEmpty()
  menu_id: number;

  @IsString()
  @IsNotEmpty()
  en_name: string;

  @IsString()
  @IsNotEmpty()
  ar_name: string;
}

export class CreateModulesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModuleItemDto)
  moduleItems: ModuleItemDto[];
}
