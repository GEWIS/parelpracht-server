import {
  Column, Entity, JoinTable, ManyToMany,
} from 'typeorm';
import { BaseEnt } from './BaseEnt';
// eslint-disable-next-line import/no-cycle
import { User } from './User';

@Entity()
export class Role extends BaseEnt {
  /** Name of the role */
  @Column()
  name!: string;

  /** All users having this role */
  @ManyToMany(() => User, (user) => user.roles)
  @JoinTable()
  users!: User[];
}
