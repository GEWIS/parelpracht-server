import {
  Column,
  Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { Role } from './Role';
// eslint-disable-next-line import/no-cycle
import { Status } from './Status';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  UNKNOWN = 'UNKOWN',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.UNKNOWN,
  })
  gender!: Gender;

  @Column()
  firstName!: string;

  @Column()
  middleName!: string;

  @Column()
  lastName!: string;

  @Column()
  email!: string;

  @Column('text')
  comment!: string;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles!: Role[];

  @OneToMany(() => Status, (status) => status.user)
  statusChanges!: Status[];

  @OneToMany(() => Status, (status) => status.createdBy)
  madeChanges!: Status[];
}
