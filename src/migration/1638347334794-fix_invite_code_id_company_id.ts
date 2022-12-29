import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class fixInviteCodeIdCompanyId1638347334794
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const userCompanyRoleTable = await queryRunner.getTable(
      'user_company_role',
    );
    await queryRunner.changeColumn(
      userCompanyRoleTable,
      'id',
      new TableColumn({
        name: 'id',
        type: 'int',
        isPrimary: true,
        generationStrategy: 'increment',
        isGenerated: true,
      }),
    );
    const inviteCodeTable = await queryRunner.getTable('invite_code');
    await queryRunner.changeColumn(
      inviteCodeTable,
      'id',
      new TableColumn({
        name: 'id',
        type: 'int',
        isPrimary: true,
        generationStrategy: 'increment',
        isGenerated: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const userCompanyRoleTable = await queryRunner.getTable(
      'user_company_role',
    );
    await queryRunner.changeColumn(
      userCompanyRoleTable,
      'id',
      new TableColumn({
        name: 'id',
        type: 'int',
        generationStrategy: 'increment',
        isGenerated: true,
      }),
    );
  }
}
