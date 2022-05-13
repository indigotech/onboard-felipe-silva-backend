import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Address } from './Address';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column()
  birthDate: string;

  @Column()
  salt: string;

  @OneToMany(() => Address, (address) => address.user, { cascade: true })
  address: Address[];
}
