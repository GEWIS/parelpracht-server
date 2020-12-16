import {
  Entity, JoinTable, ManyToMany, PrimaryColumn,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { User } from './User';

@Entity()
export class Role {
  @PrimaryColumn()
  name!: string;

  @ManyToMany(() => User, (user) => user.roles)
  @JoinTable()
  users!: User[];
}
