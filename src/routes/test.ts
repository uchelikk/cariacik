import { Router, Request, Response } from 'express';
import { isRoomMember } from '../utils/validations';

const test = async (req: Request, res: Response) => {
  return res.json({ page: 'Test', username: req.body.username });
};

const router = Router();
router.post('/test', isRoomMember(), test);
export default router;
