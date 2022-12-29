import { Module } from '@nestjs/common';

import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { UserService } from './user.service';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService, UserService],
})
export class CompanyModule {}
