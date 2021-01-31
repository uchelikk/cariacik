import { Router, Request, Response } from 'express';

const test = async (req: Request, res: Response) => {
  return res.json({ page: 'Test', username: req.body.username });
};

const router = Router();
router.post('/test', test);
export default router;
