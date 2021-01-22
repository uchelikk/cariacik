import { Column, Entity } from 'typeorm';
import MyEntity from './MyEntity';

@Entity('users')
export class User extends MyEntity {
  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  passUpdated: Date;
}
