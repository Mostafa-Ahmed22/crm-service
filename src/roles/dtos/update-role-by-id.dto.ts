import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateRoleParamsDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}