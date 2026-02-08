import { IsInt, IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ModuleItemDto {
  @IsString()
  @IsNotEmpty()
  en_name: string;

  @IsString()
  @IsNotEmpty()
  ar_name: string;
}

export class CreateModuleDto {
  @IsInt()
  menu_id: number;

  @ValidateNested({ each: true })
  @Type(() => ModuleItemDto)
  moduleItems: ModuleItemDto[];
}
