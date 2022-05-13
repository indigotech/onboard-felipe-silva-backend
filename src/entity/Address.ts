import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postalCode: number;

  @Column()
  street: string;

  @Column()
  streetNumber: number;

  @Column()
  complement?: string;

  @Column()
  neighborHood: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @ManyToOne(() => User, (user) => user.address, { onDelete: 'CASCADE' })
  user: User;
}
