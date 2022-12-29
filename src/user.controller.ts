import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { verify } from './helper/jwtToken';
import {
  AddUserDTO,
  AddUserTOCompanyDTO,
  getUserInfoFromLinkDTO,
  UsersListByCompanyParamsDTO,
  UsersListParamsDTO,
} from './dto/user.dto';
import { Roles, RolesGuard, authUser } from './auth/roles.guard';
import { user_role } from './enums/user';
import { ApiBody } from '@nestjs/swagger';
@UseGuards(RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('add')
  @UsePipes(ValidationPipe)
  addUser(@Body() body: AddUserDTO, @Res() response: Response): unknown {
    /*
        API ENDPOINT => /user/add
        Parameters => first_name, last_name, status, email, password
    * */
    return this.userService.addUserService(body, response);
  }

  @Post('add-to-company')
  @UseGuards(RolesGuard)
  @Roles(user_role.BUNKER_ADMIN, user_role.ADMIN)
  @UsePipes(ValidationPipe)
  addUserToCompany(
    @Body() body: AddUserTOCompanyDTO,
    @Req() request: Request,
    @Res() response: Response,
  ): unknown {
    /*
        API ENDPOINT => /user/add-to-company
        Parameters => first_name, last_name, status, email, password(optional), company_name
    * */
    return this.userService.addUserToCompanyService(body, request, response);
  }

  @Get('get-info')
  getUserInfo(@Req() request: Request, @Res() response: Response): unknown {
    const user_token = request.headers.authorization;
    if (user_token) {
      verify(user_token, (err, decoded) => {
        if (err) {
          return response.status(400).send({
            data: null,
            message: 'Token not valid.',
          });
        } else {
          const user_id = decoded.id;
          this.userService.getUserInfo(user_id, response);
        }
      });
    } else {
      return response.status(400).send({
        data: null,
        message: 'Token not valid.',
      });
    }
  }

  @Get('verify-code')
  @UsePipes(ValidationPipe)
  /*
        API ENDPOINT => /user/verify-invite-code
        Parameters => token
        description => Token refers to the code/token which is embedded in reset-password link sent in email
    * */
  getUserInfoFromToken(
    @Query() query: getUserInfoFromLinkDTO,
    @Res() response: Response,
  ): void {
    this.userService.getUserInfoFromLink(query, response);
  }

  @Get()
  @Roles(user_role.BUNKER_ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: false, transform: true }))
  @ApiBody({ type: [UsersListParamsDTO] })
  listUsersBunkerAdmin(
    @Query() query: UsersListParamsDTO,
    @Res() response: Response,
  ): unknown {
    /*
            API ENDPOINT => /user/list
            Parameters => page, count, sortby, sort, search
        * */
    return this.userService.listUsersBunkerAdminService(
      authUser,
      query,
      response,
    );
  }

  @Get(':company_id')
  @UsePipes(new ValidationPipe({ whitelist: false, transform: true }))
  @ApiBody({ type: [UsersListByCompanyParamsDTO] })
  listUsers(
    @Param('company_id', new ParseIntPipe()) company_id,
    @Query() query: UsersListByCompanyParamsDTO,
    @Res() response: Response,
  ): unknown {
    /*
            API ENDPOINT => /user/list
            Parameters => page, count, sortby, sort, search
        * */
    return this.userService.listUsersService(
      authUser,
      company_id,
      query,
      response,
    );
  }
}
