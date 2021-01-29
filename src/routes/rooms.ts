import { Router, Request, Response } from 'express';
import Room from '../schema/rooms';

const createRoom = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const room = new Room({ name, description, roomOwner: res.locals.user.id });
    await room.save();
    return res.json(room);
  } catch (error) {
    return res.json(error);
  }
};

const getRoom = async (req: Request, res: Response) => {
  const { id } = req.params;
  const room = await Room.findById(id);
  const room2 = await room.populate('roomOwner').execPopulate();
  return res.json(room2);
};

const router = Router();
router.post('/create', createRoom);
router.get('/:id', getRoom);
export default router;
