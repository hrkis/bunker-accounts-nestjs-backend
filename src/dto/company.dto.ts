import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsAlpha,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  ValidateIf,
} from 'class-validator';

export class AddCompanyDTO {
  @ApiProperty()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;
}

export class PaginationParamsDTO {
  @ApiProperty()
  @IsNotEmpty({ message: 'Page is required' })
  @IsNumber()
  @Type(() => Number)
  page: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  count: number;

  @ApiProperty()
  @ValidateIf((o) => o.sort)
  @IsAlpha()
  @IsEnum(
    { ASC: 'asc', DESC: 'desc' },
    { message: 'Sort order must be asc or desc' },
  )
  sort: string;

  @ApiProperty()
  @ValidateIf((o) => o.sortby)
  @IsAlpha()
  sortby: string;
}
