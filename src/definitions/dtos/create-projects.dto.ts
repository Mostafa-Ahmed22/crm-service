import { IsString, IsNotEmpty, ValidateNested, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ProjectDto {
  
  @IsString()
  @IsNotEmpty()
  en_name: string;

  @IsString()
  @IsNotEmpty()
  ar_name: string;  

  @IsString()
  @IsNotEmpty()
  company_code: string;
  
  @IsString()
  @IsNotEmpty()
  project_code: string;
}

export class CreateProjectDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectDto)
  projects: ProjectDto[];
}
