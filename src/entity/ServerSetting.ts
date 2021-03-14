import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ServerSetting {
  @PrimaryColumn()
  readonly name!: string;

  @Column()
  value!: string;
}
