import {
  Entity,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { user_role } from '../enums/user';
import { UserEntity } from './user.entity';
import { CompanyEntity } from './company.entity';

@Entity({ name: 'user_company_role' })
export class UserCompanyRoleEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({
    type: 'enum',
    nullable: false,
    enum: [
      user_role.ADMIN,
      user_role.BUNKER_ADMIN,
      user_role.EDITOR,
      user_role.VIEWER,
    ],
    default: user_role.BUNKER_ADMIN,
  })
  role: user_role;

  @Column({
    type: 'number',
    nullable: false,
  })
  user_id: number;

  @Column({
    type: 'number',
    nullable: true,
  })
  company_id: number;

  @ManyToOne(() => UserEntity, (user) => user.user_company_role)
  @JoinColumn({
    name: 'user_id',
  })
  user: UserEntity;

  @ManyToOne(() => CompanyEntity, (company) => company.user_company_role)
  @JoinColumn({
    name: 'company_id',
  })
  company: CompanyEntity;

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
