import {
  Column, Entity,
} from 'typeorm';
import { BaseEnt } from './BaseEnt';
import { VAT } from './enums/ValueAddedTax';

@Entity()
export class ValueAddedTax extends BaseEnt {
  /** VAT category */
  @Column({
    type: 'enum',
    enum: VAT,
    default: VAT.HIGH,
  })
  category!: VAT;

  /** Price is stored * 100 and as integer */
  @Column({ type: 'integer' })
  amount!: number;
}
