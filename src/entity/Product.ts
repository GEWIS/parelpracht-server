import {
  Column, Entity, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { ProductInstance } from './ProductInstance';
// eslint-disable-next-line import/no-cycle
import { Status } from './Status';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  nameDutch!: string;

  @Column()
  nameEnglish!: string;

  @Column()
  targetPrice!: number;

  @Column('text')
  description!: string;

  @Column('text')
  contractTextDutch!: string;

  @Column('text')
  contractTextEnglish!: string;

  @Column('text')
  deliverySpecificationDutch!: string;

  @Column('text')
  deliverySpecificationEnglish!: string;

  @OneToMany(() => ProductInstance, (productInstance) => productInstance.product)
  instances!: ProductInstance[];

  @OneToMany(() => Status, (status) => status.product)
  statusChanges!: Status[];
}
