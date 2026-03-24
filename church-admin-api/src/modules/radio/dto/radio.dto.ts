import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateRadioDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description: string;

  @IsUrl()
  @IsNotEmpty()
  stream_url: string;

  @IsUrl()
  @IsOptional()
  featured_image_url: string;

  @IsBoolean()
  @IsOptional()
  is_active: boolean = false;
}

export class UpdateRadioDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description: string;

  @IsUrl()
  @IsOptional()
  stream_url: string;

  @IsUrl()
  @IsOptional()
  featured_image_url: string;

  @IsBoolean()
  @IsOptional()
  is_active: boolean;
}

export class RadioQueryDto {
  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsBoolean()
  is_active: boolean;

  @IsOptional()
  @IsString()
  sort: string = '-created_at';

  @IsOptional()
  page: number = 1;

  @IsOptional()
  limit: number = 10;
}
