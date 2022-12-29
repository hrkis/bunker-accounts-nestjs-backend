import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDTO {
  @ApiProperty()
  @IsNotEmpty({ message: 'Email id is required' })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Password id is required' })
  password: string;
}
export class forgotPasswordDTO {
  @ApiProperty()
  @IsNotEmpty({ message: 'Email id is required' })
  email: string;
}
