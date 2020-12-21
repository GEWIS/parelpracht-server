import {
  Column, Entity, JoinTable, ManyToMany,
} from 'typeorm';
import { BaseEnt } from './BaseEnt';
// eslint-disable-next-line import/no-cycle
import { User } from './User';

@Entity()
export class Role extends BaseEnt {
  @Column()
  name!: string;

  @ManyToMany(() => User, (user) => user.roles)
  @JoinTable()
  users!: User[];
}
