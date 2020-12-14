import {
  Column, Entity, JoinTable, ManyToOne, ManyToMany, PrimaryGeneratedColumn, JoinColumn,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { Company } from './Company';
import { Product } from './Product';

@Entity()
export class Agreement {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  title!: string;

  @Column({ type: 'int' })
  companyId!: number;

  @ManyToOne(() => Company, (company) => company.agreements)
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @ManyToMany(() => Product)
  @JoinTable()
  products!: Product[];

  // TODO: contact person

  @Column('date')
  date!: Date;

  @Column()
  poNumber!: string;

  @Column()
  comments!: string;

  // TODO: add status changes

  // TODO: add files
}
