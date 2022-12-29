import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class updateUserCompanyRole1638257600530 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const userCompanyRoleTable = await queryRunner.getTable(
      'user_company_role',
    );
    const newUserCompanyRoleTable = userCompanyRoleTable.clone();
    await queryRunner.changeColumn(
      newUserCompanyRoleTable,
      'company_id',
      new TableColumn({
        name: 'company_id',
        type: 'int',
        isNullable: true,
      }),
    );
    await queryRunner.changeColumn(
      newUserCompanyRoleTable,
      'id',
      new TableColumn({
        name: 'id',
        type: 'int',
        generationStrategy: 'increment',
        isGenerated: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const userCompanyRoleTable = await queryRunner.getTable(
      'user_company_role',
    );
    const newUserCompanyRoleTable = userCompanyRoleTable.clone();
    await queryRunner.changeColumn(
      newUserCompanyRoleTable,
      'company_id',
      new TableColumn({
        name: 'company_id',
        type: 'int',
        isNullable: false,
      }),
    );
    await queryRunner.changeColumn(
      newUserCompanyRoleTable,
      'id',
      new TableColumn({
        name: 'id',
        type: 'int',
        isPrimary: true,
      }),
    );
  }
}
