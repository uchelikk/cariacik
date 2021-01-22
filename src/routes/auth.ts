import { Router, Request, Response } from 'express';

const register = (_req: Request, res: Response) => {
  return res.json({
    message: 'Register will be here',
  });
};

const login = (_req: Request, res: Response) => {
  return res.json({
    message: 'Login will be here',
  });
};

const router = Router();
router.post('/register', register);
router.post('/login', login);
export default router;
