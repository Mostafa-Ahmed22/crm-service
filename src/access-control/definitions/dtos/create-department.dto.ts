import { IsString, IsNotEmpty, ValidateNested, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  en_name: string;

  @IsString()
  @IsNotEmpty()
  ar_name: string;  
  @IsInt()
  @IsOptional()
  show_in_mobile: number;

}

// export class CreateDepartmentDto {
//   @ValidateNested({ each: true })
//   @Type(() => DepartmentItemDto)
//   departmentItems: DepartmentItemDto[];
// }
