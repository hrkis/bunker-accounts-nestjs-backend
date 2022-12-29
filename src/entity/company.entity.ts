import {
  Entity,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { company_status } from '../enums/company';
import { UserCompanyRoleEntity } from './user_company_role.entity';

@Entity({ name: 'company' })
export class CompanyEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({
    type: 'enum',
    enum: [
      company_status.actived,
      company_status.blocked,
      company_status.deleted,
    ],
    default: company_status.actived,
    nullable: false,
  })
  status: company_status;

  @OneToMany(
    () => UserCompanyRoleEntity,
    (user_company_role) => user_company_role.company,
  )
  user_company_role: UserCompanyRoleEntity[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  updatedAt: Date;
}
