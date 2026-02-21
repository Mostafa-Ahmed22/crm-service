import { IsString, IsOptional } from 'class-validator';

export class SearchRoleDto {
  @IsString()
  @IsOptional()
  role_name: string;
  
  @IsString()
  @IsOptional()
  role_id: string;

  @IsString()
  @IsOptional()
  page: string;

  @IsString()
  @IsOptional()
  limit: string;

  @IsString()
  @IsOptional()
  skip: string;
}