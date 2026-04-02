import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  IsEnum,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ContentStatus } from '../../../common/enums';

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/i, {
    message: 'Color must be a valid hex color code',
  })
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  icon?: string;

  @IsOptional()
  @IsUUID()
  parent_id?: string;

  @IsOptional()
  @IsInt()
  order?: number = 0;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus = ContentStatus.ACTIVE;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/i, {
    message: 'Color must be a valid hex color code',
  })
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  icon?: string;

  @IsOptional()
  @IsUUID()
  parent_id?: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}

export class CategoryQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsOptional()
  @IsUUID()
  parent_id?: string;

  @IsOptional()
  @IsString()
  sort_by?: 'name' | 'order' | 'created_at' = 'order';

  @IsOptional()
  @IsString()
  order_dir?: 'ASC' | 'DESC' = 'ASC';

  @IsOptional()
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @IsInt()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  include_children?: string;
}

export class ReorderCategoryDto {
  @IsUUID()
  id: string;

  @IsInt()
  order: number;
}

export class BulkCategoryActionDto {
  @IsUUID('4', { each: true })
  ids: string[];

  @IsString()
  action: 'delete' | 'restore' | 'activate' | 'deactivate';
}
