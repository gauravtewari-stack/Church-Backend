import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

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
  sort_order?: number = 0;

  @IsOptional()
  @IsBoolean()
  is_visible?: boolean = true;
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
  sort_order?: number;

  @IsOptional()
  @IsBoolean()
  is_visible?: boolean;
}

export class CategoryQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  is_visible?: boolean;

  @IsOptional()
  @IsUUID()
  parent_id?: string;

  @IsOptional()
  @IsString()
  sort_by?: 'name' | 'sort_order' | 'created_at' = 'sort_order';

  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC' = 'ASC';

  @IsOptional()
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @IsInt()
  limit?: number = 10;

  @IsOptional()
  @IsBoolean()
  include_children?: boolean = false;
}

export class ReorderCategoryDto {
  @IsUUID()
  id: string;

  @IsInt()
  sort_order: number;
}

export class BulkCategoryActionDto {
  @IsUUID('4', { each: true })
  ids: string[];

  @IsString()
  action: 'delete' | 'restore' | 'hide' | 'show';
}
