import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
