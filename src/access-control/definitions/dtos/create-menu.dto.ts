import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MenuItemDto {
  @IsString()
  @IsNotEmpty()
  en_name: string;

  @IsString()
  @IsNotEmpty()
  ar_name: string;
}

export class CreateMenuDto {
  @ValidateNested({ each: true })
  @Type(() => MenuItemDto)
  menus: MenuItemDto[];
}
