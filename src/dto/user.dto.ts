import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsAlpha,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf,
  IsEmail,
} from 'class-validator';

export class AddUserDTO {
  @ApiProperty()
  @IsNotEmpty({ message: 'first_name is required' })
  first_name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'last_name is required' })
  last_name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'email is required' })
  @IsEmail()
  email: string;

  @ApiProperty()
  password: string;
}

export class AddUserTOCompanyDTO {
  @ApiProperty()
  @IsNotEmpty({ message: 'first_name is required' })
  first_name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'last_name is required' })
  last_name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'email is required' })
  @IsEmail()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'add_to_company array is required' })
  add_to_company: any; // array
}
export class getUserInfoFromLinkDTO {
  @ApiProperty()
  @IsNotEmpty({ message: 'Code is required' })
  code: string;
}

export class UsersListParamsDTO {
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
  @IsEnum(
    { ASC: 'asc', DESC: 'desc' },
    { message: 'Sort order must be asc or desc' },
  )
  sort: string;

  @ApiProperty()
  @ValidateIf((o) => o.sortby)
  sortby: string;

  @ApiProperty()
  @ValidateIf((o) => o.search)
  @IsString()
  search: string;
}

export class UsersListByCompanyParamsDTO {
  @ApiProperty()
  company_id: number;

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
  @IsEnum(
    { ASC: 'asc', DESC: 'desc' },
    { message: 'Sort order must be asc or desc' },
  )
  sort: string;

  @ApiProperty()
  @ValidateIf((o) => o.sortby)
  sortby: string;

  @ApiProperty()
  @ValidateIf((o) => o.search)
  @IsString()
  search: string;
}
export class validateAndSetPasswordDTO {
  @ApiProperty()
  @IsNotEmpty({ message: 'Code is required' })
  code: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
