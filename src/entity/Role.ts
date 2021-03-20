import {
  Column, Entity, JoinTable, ManyToMany, PrimaryColumn,
} from 'typeorm';
import { BaseEnt } from './BaseEnt';
// eslint-disable-next-line import/no-cycle
import { User } from './User';

@Entity()
export class Role {
  /** Name of the role */
  @PrimaryColumn()
  readonly name!: string;

  /** All users having this role */
  @ManyToMany(() => User, (user) => user.roles, { onDelete: 'CASCADE' })
  @JoinTable()
  users!: User[];
}
