import { Column, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEnt } from '../BaseEnt';
import { User } from '../User';

export default abstract class BaseFile extends BaseEnt {
  /** Name of the file as shown in the front-end */
  @Column()
  name!: string;

  /** Name of the file as shown when downloaded */
  @Column({ default: '' })
  downloadName!: string;

  /** Location of the file on disk */
  @Column()
  location!: string;

  /** User who created this file */
  @ManyToOne(() => User)
  @JoinColumn()
  createdBy!: User;
}
