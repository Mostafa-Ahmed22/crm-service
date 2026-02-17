import { IsInt, IsString, IsNotEmpty, ValidateNested, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UserTypeDto {
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

export class CreateUserTypesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserTypeDto)
  userTypes: UserTypeDto[];
}
