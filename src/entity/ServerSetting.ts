import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ServerSetting {
  @PrimaryColumn()
  name!: string;

  @Column()
  value!: string;
}
