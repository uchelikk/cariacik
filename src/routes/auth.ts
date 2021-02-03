import { Router, Request, Response } from 'express';
import * as v from '../utils/validations';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../schema/users';

const register = async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;
  const hPassword = await bcryptjs.hash(password, 10);

  try {
    const user = new User({ email, fullName, password: hPassword });
    await user.save();

    return res.json({ user });
  } catch (err) {
    if (err.code === 11000)
      return res.json({
        field: 'email',
        message: 'Mail adresi daha önce alındı',
      });
    return res.json({ err });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }, 'password');

    const comparedPassword = await bcryptjs.compare(password, user.password);
    if (comparedPassword) {
      req.session.user = await jwt.sign(
        { id: user.id, email: user.email, fullName: user.fullName },
        process.env.JWT_SECRET!
      );
      return res.json({ login: true, user: user.id });
    } else {
      throw Error('Giriş başarısız!');
    }
  } catch (error) {
    return res.json({ login: false });
  }
};

const router = Router();
router.post(
  '/register',
  [v.email, v.fullName, v.password],
  v.isError,
  register
);
router.post('/login', [v.email, v.password], v.isError, login);
export default router;

/**
 * @description req.session @types:
 * node_modules / @types / express-session / index.d.ts -> SessionData (Cookie üstüne)
 * [key: string]: any;
 *
 * @description req.session @ts-ignore:
 * bir üst satıra //@ts-ignore ekle
 */
