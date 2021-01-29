import { Router, Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../schema/users';

const register = async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;

  try {
    const user = new User({ email, fullName, password });
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

    const user = await User.findOne({ email });

    const comparedPassword = await bcryptjs.compare(password, user.password);
    if (comparedPassword) {
      req.session.user = await jwt.sign(
        { id: user.id, email: user.email, fullName: user.fullName },
        process.env.JWT_SECRET!
      );
      return res.json({ login: true });
    } else {
      throw Error('login failed');
    }
  } catch (error) {
    return res.json({ login: false });
  }
};

const router = Router();
router.post('/register', register);
router.post('/login', login);
export default router;

/**
 * @description req.session @types:
 * node_modules / @types / express-session / index.d.ts -> SessionData (Cookie üstüne)
 * [key: string]: any;
 *
 * @description req.session @ts-ignore:
 * bir üst satıra //@ts-ignore ekle
 */
