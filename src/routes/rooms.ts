import { Router, Request, Response } from 'express';
import toid from '../utils//id';
import Timelanes from '../schema/timelanes';
import Room from '../schema/rooms';
import * as v from '../utils/validations';

const createRoom = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    // Max Room Rate;
    const user = res.locals.user.id;
    const roomCount = await Room.find({
      roomOwner: toid(user),
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
      toid(user.id).equals(isRoom.roomOwner)
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

    const result = await Room.findOneAndUpdate(
      { _id: toid(id), roomOwner: toid(user.id) },
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

    // Delete Room
    // TODO: Delete other parts, too...
    const room = await Room.findOneAndDelete({
      _id: toid(id),
      roomOwner: toid(user.id),
    });
    const timelanes = room ? await Timelanes.remove({ room: room._id }) : {};

    return res.json({ room, timelanes });
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
    if (user.id != toid(id)) {
      throw new Error('Yetkiniz bulunmamaktadır.');
    } else {
      const owned = await Room.find({
        roomOwner: toid(id),
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

const getTimeLane = async (req: Request, res: Response) => {
  const { id, page } = req.params;
  const LIMIT = 30;
  const PAGE: number =
    page === 'undefined' ? 0 : parseInt(page) > 0 ? parseInt(page) - 1 : 0;
  let timeline = await Timelanes.find({ room: toid(id) })
    .sort({
      updatedAt: -1,
    })
    .limit(LIMIT)
    .skip(LIMIT * PAGE)
    .populate('user');

  return res.json(timeline);
};

const router = Router();
router.post('/create', [v.name, v.description], v.isError, createRoom);
router.get('/:id', getRoom);
router.post('/update/:id', [v.name, v.description], v.isError, updateRoom);
router.post('/delete/:id', deleteRoom);
router.get('/:id/timeline/:page', getTimeLane);

router.post('/join', [v.roomCode], v.isError, joinRoom);
router.get('/user/:id', usersRooms);
export default router;
