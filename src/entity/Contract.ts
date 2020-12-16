import {
  Column, Entity, JoinTable, ManyToOne, ManyToMany, PrimaryGeneratedColumn, JoinColumn, OneToMany,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { Company } from './Company';
// eslint-disable-next-line import/no-cycle
import { Contact } from './Contact';
// eslint-disable-next-line import/no-cycle
import { Product } from './Product';
// eslint-disable-next-line import/no-cycle
import { Status } from './Status';

@Entity()
export class Contract {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  title!: string;

  @Column({ type: 'int' })
  companyId!: number;

  @ManyToOne(() => Company, (company) => company.contracts)
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @ManyToMany(() => Product)
  @JoinTable()
  products!: Product[];

  @Column({ type: 'int' })
  contactId!: number;

  @ManyToOne(() => Contact, (contact) => contact.contracts)
  @JoinColumn({ name: 'contactId' })
  contact!: Contact;

  @Column('date')
  date!: Date;

  @Column()
  poNumber!: string;

  @Column()
  comments!: string;

  @OneToMany(() => Status, (status) => status.contract)
  statusChanges!: Status[];

  // TODO: add files
}
