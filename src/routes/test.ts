import { Router, Request, Response } from 'express';

const test = async (_req: Request, res: Response) => {
  return res.json({ page: 'Test' });
};

const router = Router();
router.post('/test', test);
export default router;
