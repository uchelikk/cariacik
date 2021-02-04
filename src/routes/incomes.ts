import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Incomes from '../schema/incomes';
import * as v from '../utils/validations';
import toid from '../utils/id';
import Room from '../schema/rooms';

const createIncomes = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user.id;
    const { room, name, description, amount } = req.body;
    const incomes = new Incomes({ name, description, amount, room, user });
    const result = await incomes.save();
    return res.json(result);
  } catch (error) {
    return res.json({ error: 'Gelir kaydı oluşturulamadı.' });
  }
};

const updateIncomes = async (req: Request, res: Response) => {
  // FALSE olanlar güncellenmelidir. Yoksa karışıklık olur.
  try {
    const user = res.locals.user.id;
    const { id } = req.params;
    const { name, description, amount } = req.body;
    const result = await Incomes.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(id),
        user: mongoose.Types.ObjectId(user),
        isActive: false,
      },
      {
        name,
        description,
        amount,
      },
      { new: true }
    );
    return res.json(result);
  } catch (error) {
    return res.json({ error: 'Gelir kaydı güncellenemedi.' });
  }
};

const readIncomes = async (req: Request, res: Response) => {
  const { id, page } = req.params;
  const LIMIT = 30;
  const PAGE: number =
    page === 'undefined' ? 0 : parseInt(page) > 0 ? parseInt(page) - 1 : 0;

  const incomes = await Incomes.find({
    room: mongoose.Types.ObjectId(id),
  })
    .sort({ createdAt: -1 })
    .limit(LIMIT)
    .skip(LIMIT * PAGE)
    .populate('user');

  return res.json(incomes);
};

const deleteIncomes = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = res.locals.user.id;
  try {
    const result = await Incomes.findOneAndDelete({ _id: id, user });
    return res.json(result);
  } catch (error) {
    return res.json(error);
  }
};

const setActive = async (req: Request, res: Response) => {
  const id = req.params.id;
  const user = res.locals.user.id;
  try {
    const original = await Incomes.findOne({
      _id: toid(id),
      user: toid(user),
    });

    if (original) {
      if (original.isActive) {
        // De Active Edilecek.
        const updateActivate = await Incomes.findOneAndUpdate(
          { _id: original.id, user: original.user },
          { isActive: false },
          { new: true }
        );

        const updateRoom = await Room.findOneAndUpdate(
          { _id: original.room },
          {
            $inc: {
              totalMoney: -original.amount,
            },
          },
          { new: true }
        );

        return res.json({ room: updateRoom, incomes: updateActivate });
      } else {
        // Active Edilecek.
        const updateActivate = await Incomes.findOneAndUpdate(
          { _id: original.id, user: original.user },
          { isActive: true },
          { new: true }
        );

        const updateRoom = await Room.findOneAndUpdate(
          { _id: original.room },
          {
            $inc: {
              totalMoney: original.amount,
            },
          },
          { new: true }
        );

        return res.json({ room: updateRoom, incomes: updateActivate });
      }
    } else {
      return res.json({});
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const router = Router();
router.post(
  '/create',
  v.name,
  v.description,
  v.iAmount,
  v.isRoomMember(),
  v.isError,
  createIncomes
);
router.get('/:id/:page?', readIncomes);
router.post(
  '/update/:id',
  v.name,
  v.description,
  v.iAmount,
  v.isError,
  updateIncomes
);
router.post('/delete/:id', deleteIncomes);

router.post('/active/:id', setActive);
export default router;
