import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Incomes from '../schema/incomes';
import Outgoings from '../schema/outgoings';
import Room, { IRoom } from '../schema/rooms';
import * as v from '../utils/validations';

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
    if (!user) throw new Error('Giriş yapılmamış!');

    const isRoom = await Room.findOne({ roomCode });
    if (!isRoom) throw new Error('Hatalı davet kodu!');

    if (
      isRoom.users.includes(user.id) ||
      mongoose.Types.ObjectId(user.id).equals(isRoom.roomOwner)
    ) {
      throw new Error('Önceden katıldınız!');
    } else {
      // Added in ROOM
      const result = await Room.findOneAndUpdate(
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
      throw new Error('Yetkiniz bulunmamaktadır.');

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
      throw new Error('Yetkiniz bulunmamaktadır.');

    // Delete Room
    // TODO: Delete other parts, too...
    const deletedRoom = await Room.findByIdAndDelete(id);
    const incomes = deletedRoom ? await Incomes.remove({ room: room._id }) : {};
    const out = deletedRoom ? await Outgoings.remove({ room: room._id }) : {};

    return res.json({ room: deletedRoom, incomes, outgoings: out });
  } catch (err) {
    return res.status(400).json({
      error: err.message,
    });
  }
};

const usersRooms = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = res.locals.user;
    if (user.id != mongoose.Types.ObjectId(id)) {
      throw new Error('Yetkiniz bulunmamaktadır.');
    } else {
      const owned = await Room.find({
        roomOwner: mongoose.Types.ObjectId(id),
      });

      const joined = await Room.find({
        users: {
          $in: user.id,
        },
      });

      return res.json({
        owned,
        joined,
      });
    }
  } catch (err) {
    return res.json({ error: err.message });
  }
};

const router = Router();
router.post('/create', [v.name, v.description], v.isError, createRoom);
router.get('/:id', getRoom);
router.post('/update/:id', [v.name, v.description], v.isError, updateRoom);
router.post('/delete/:id', deleteRoom);

router.post('/join', [v.roomCode], v.isError, joinRoom);
router.get('/user/:id', usersRooms);
export default router;
