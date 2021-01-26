import { Router, Request, Response } from 'express';

const register = (req: Request, res: Response) => {
  const { email, password } = req.body;
  return res.json({
    message: 'Register will be here',
    user: req.session.user,
    email,
    password,
  });
};

const login = (req: Request, res: Response) => {
  req.session.user = { id: 1, username: 'Umit' };
  return res.json({
    message: 'Login will be here',
  });
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
