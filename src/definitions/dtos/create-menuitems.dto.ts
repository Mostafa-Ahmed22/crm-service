import { IsInt, IsString, IsNotEmpty, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class MenuitemDto {
  @IsInt()
  @IsNotEmpty()
  menu_id: number;

  @IsString()
  @IsNotEmpty()
  en_name: string;

  @IsString()
  @IsNotEmpty()
  ar_name: string;

  @IsString()
  @IsNotEmpty()
  screen: string;
}

export class CreateMenuitemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuitemDto)
  menuitems: MenuitemDto[];
}
