import {
  Entity,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserCompanyRoleEntity } from './user_company_role.entity';
import { InviteCodesEntity } from './invite_codes.entity';
import { user_status } from '../enums/user';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  first_name: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  last_name: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  email: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    default: '',
    select: false,
  })
  password: string;

  @Column({
    type: 'enum',
    enum: [
      user_status.pending,
      user_status.actived,
      user_status.blocked,
      user_status.deleted,
    ],
    default: user_status.pending,
    nullable: false,
  })
  user_status: user_status;

  @OneToMany(
    () => UserCompanyRoleEntity,
    (user_company_role) => user_company_role.user,
  )
  user_company_role: UserCompanyRoleEntity[];

  @OneToMany(() => InviteCodesEntity, (invite_code) => invite_code.user)
  invite_code: InviteCodesEntity[];

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
