import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FeatureItemDto {
  @IsString()
  @IsNotEmpty()
  en_name: string;

  @IsString()
  @IsNotEmpty()
  ar_name: string;
}

export class CreateFeatureDto {
  @ValidateNested({ each: true })
  @Type(() => FeatureItemDto)
  featureItems: FeatureItemDto[];
}
