import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { Response } from 'express';
import { AddCompanyDTO, PaginationParamsDTO } from './dto/company.dto';
import { authUser, Roles, RolesGuard } from './auth/roles.guard';
import { user_role } from './enums/user';
import { AuthGuard } from './auth/auth.guard';
import { ApiBody } from '@nestjs/swagger';

@UseGuards(AuthGuard, RolesGuard)
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post('add')
  @Roles(user_role.BUNKER_ADMIN)
  @UsePipes(ValidationPipe)
  addCompany(@Body() body: AddCompanyDTO, @Res() response: Response): void {
    /*
            API ENDPOINT => /company/add
            Parameters => name
        * */
    this.companyService.addCompanyService(body, response);
  }

  @Get('list')
  @UsePipes(new ValidationPipe({ whitelist: false, transform: true }))
  @ApiBody({ type: [PaginationParamsDTO] })
  listCompanies(
    @Query() query: PaginationParamsDTO,
    @Res() response: Response,
  ): unknown {
    /*
            API ENDPOINT => /company/list
            Parameters => page, count, sortby, sort
        * */
    return this.companyService.listCompaniesService(authUser, query, response);
  }
}
