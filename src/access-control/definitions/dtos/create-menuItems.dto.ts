import { IsInt, IsString, IsNotEmpty, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class MenuItemDto {
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

export class CreateMenuItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemDto)
  menuItems: MenuItemDto[];
}
