import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PrivilegeItemDto {
  @IsString()
  @IsNotEmpty()
  en_name: string;

  @IsString()
  @IsNotEmpty()
  ar_name: string;
}

export class CreatePrivilegeDto {
  @ValidateNested({ each: true })
  @Type(() => PrivilegeItemDto)
  privilegeItems: PrivilegeItemDto[];
}
