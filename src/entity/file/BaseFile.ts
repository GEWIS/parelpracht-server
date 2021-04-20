import { Column, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEnt } from '../BaseEnt';
import { User } from '../User';

export default abstract class BaseFile extends BaseEnt {
  /** Name of the file as shown in the front-end */
  @Column()
  name!: string;

  /** Name of the file as shown when downloaded */
  @Column({ default: '', update: false })
  downloadName!: string;

  /** Location of the file on disk */
  @Column()
  location!: string;

  @Column({ type: 'integer', update: false })
  readonly createdById!: number;

  /** User who created this file */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy!: User;
}
