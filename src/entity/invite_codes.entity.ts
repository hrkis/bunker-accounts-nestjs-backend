import {
  Entity,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from './user.entity';
import { invite_code_status, invite_code_type } from '../enums/user';
@Entity({ name: 'invite_code' })
export class InviteCodesEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  code: string;

  @Column({
    type: 'enum',
    nullable: false,
    enum: [invite_code_type.resetPassword, invite_code_type.setPassword],
  })
  type: invite_code_type;

  @Column({
    type: 'enum',
    nullable: false,
    enum: [
      invite_code_status.used,
      invite_code_status.expired,
      invite_code_status.pending,
    ],
    default: invite_code_status.pending,
  })
  status: invite_code_status;

  @Column({
    type: 'number',
    nullable: false,
  })
  user_id: number;

  @ManyToOne(() => UserEntity, (user) => user.invite_code)
  @JoinColumn({
    name: 'user_id',
  })
  user: UserEntity;

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
