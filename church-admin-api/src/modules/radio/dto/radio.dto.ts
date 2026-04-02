import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRadioDto {
  @ApiProperty({ description: 'Station name', example: 'Grace FM' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ description: 'Station description', example: '24/7 Christian worship music' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description: string;

  @ApiProperty({ description: 'Stream URL', example: 'https://stream.gracefm.org/live' })
  @IsUrl()
  @IsNotEmpty()
  stream_url: string;

  @ApiPropertyOptional({ description: 'Featured image URL' })
  @IsUrl()
  @IsOptional()
  featured_image_url: string;

  @ApiPropertyOptional({ description: 'Whether the station is active', default: false })
  @IsBoolean()
  @IsOptional()
  is_active: boolean = false;
}

export class UpdateRadioDto {
  @ApiPropertyOptional({ description: 'Station name' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ description: 'Station description' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description: string;

  @ApiPropertyOptional({ description: 'Stream URL' })
  @IsUrl()
  @IsOptional()
  stream_url: string;

  @ApiPropertyOptional({ description: 'Featured image URL' })
  @IsUrl()
  @IsOptional()
  featured_image_url: string;

  @ApiPropertyOptional({ description: 'Active status' })
  @IsBoolean()
  @IsOptional()
  is_active: boolean;
}

export class RadioQueryDto {
  @ApiPropertyOptional({ description: 'Search by title' })
  @IsOptional()
  @IsString()
  search: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  is_active: boolean;

  @ApiPropertyOptional({ description: 'Sort field', default: '-created_at' })
  @IsOptional()
  @IsString()
  sort: string = '-created_at';

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  limit: number = 10;
}
