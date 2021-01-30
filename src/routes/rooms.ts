import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Room, { IRoom } from '../schema/rooms';

const createRoom = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    // Max Room Rate;
    const user = res.locals.user.id;
    const roomCount = await Room.find({
      roomOwner: mongoose.Types.ObjectId(user),
    });
    if (roomCount >= 10) throw new Error('Çok fazla oda oluşturdunuz');
    const room = new Room({
      name,
      description,
      roomOwner: res.locals.user.id,
    });

    const result = await room.save();

    return res.json(result);
  } catch (err) {
    return res.status(400).json({
      error: err.message,
    });
  }
};

const getRoom = async (req: Request, res: Response) => {
  const { id } = req.params;
  let room = await Room.findById(id);
  if (room)
    room = await room.populate('users').populate('roomOwner').execPopulate();

  return res.json(room);
};

const joinRoom = async (req: Request, res: Response) => {
  const { roomCode } = req.body;
  const user = res.locals.user;
  try {
    if (!user) throw new Error('Not logged!');

    const isRoom = await Room.findOne({ roomCode });
    if (!isRoom) throw new Error('Wrong room code!');

    if (isRoom.users.includes(user.id)) {
      throw new Error('Already joinned!');
    } else {
      // Added in ROOM
      const result = await Room.updateOne(
        { roomCode },
        {
          $addToSet: {
            users: user.id,
          },
        },
        {
          new: true,
        }
      );

      return res.json(result);
    }
  } catch (err) {
    return res.status(400).json({
      error: err.message,
    });
  }
};

const updateRoom = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const { id } = req.params;
    const user = res.locals.user;
    const room: IRoom = await Room.findById(id);

    if (room.roomOwner + '' !== user.id + '')
      throw new Error('Not Authorization');

    const result = await Room.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(id) },
      { name, description },
      { new: true }
    );

    return res.json(result);
  } catch (err) {
    return res.status(400).json({
      error: err.message,
    });
  }
};

const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = res.locals.user;
    const room: IRoom = await Room.findById(id);

    if (room.roomOwner + '' !== user.id + '')
      throw new Error('Not Authorization');

    // Delete Room
    // TODO: Delete other parts, too...
    const result = await Room.findByIdAndDelete(id);

    return res.json(result);
  } catch (err) {
    return res.status(400).json({
      error: err.message,
    });
  }
};

const router = Router();
router.post('/create', createRoom);
router.get('/:id', getRoom);
router.post('/update/:id', updateRoom);
router.post('/delete/:id', deleteRoom);
router.post('/join', joinRoom);
export default router;
