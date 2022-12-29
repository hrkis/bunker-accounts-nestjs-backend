import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

import { company_status } from '../enums/company';

export class addCompanyStatusInCompany1638343959064
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'company',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: [
          company_status.actived,
          company_status.blocked,
          company_status.deleted,
        ],
        default: "'" + `${company_status.actived}` + "'",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('company', 'status');
  }
}
