import User, { IUser } from '../schema/users';

export default class UserController {
  static addNewUser = async (user: Partial<IUser>) => {
    const result = await new User(user);

    return result;
  };
}
