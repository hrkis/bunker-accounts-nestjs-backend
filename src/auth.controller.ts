import {
  Controller,
  Post,
  Res,
  Body,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LoginDTO, forgotPasswordDTO } from './dto/auth.dto';
import { validateAndSetPasswordDTO } from './dto/user.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UsePipes(ValidationPipe)
  Login(@Body() body: LoginDTO, @Res() response: Response): void {
    /*
          API ENDPOINT => /auth/login
        * Parameters => email, password
        * */
    const reqParam = body;
    this.authService.LoginService(reqParam, response);
  }

  @Post('set-password')
  @UsePipes(ValidationPipe)
  validateAndSetPassword(
    @Body() body: validateAndSetPasswordDTO,
    @Res() response: Response,
  ): void {
    /*
      API ENDPOINT => /auth/set-password
    * Parameters => invite, password
    * */
    this.authService.validateAndSetPasswordService(body, response);
  }

  @Post('forgot-password')
  @UsePipes(ValidationPipe)
  forgotPasword(
    @Body() body: forgotPasswordDTO,
    @Res() response: Response,
  ): void {
    /*
      API ENDPOINT => /auth/forgot-password
    * Parameters => email
    * */
    this.authService.forgotPasswordService(body, response);
  }
}
