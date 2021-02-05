import { Router, Request, Response } from 'express';
import * as v from '../utils/validations';
import Outgoings from '../schema/outgoings';
import toid from '../utils/id';
import Room from '../schema/rooms';

const createOutgoings = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user.id;
    const { room, name, description, amount } = req.body;
    const outgoings = new Outgoings({ name, description, amount, room, user });
    const result = await outgoings.save();
    return res.json(result);
  } catch (error) {
    return res.json({ error: 'Gider kaydı oluşturulamadı.' });
  }
};

const readOutgoings = async (req: Request, res: Response) => {
  const { id, page } = req.params;
  const LIMIT = 30;
  const PAGE: number =
    page === 'undefined' ? 0 : parseInt(page) > 0 ? parseInt(page) - 1 : 0;

  const outgoings = await Outgoings.find({
    room: toid(id),
  })
    .sort({ updatedAt: -1 })
    .limit(LIMIT)
    .skip(LIMIT * PAGE)
    .populate('user');

  return res.json(outgoings);
};

const updateOutgoings = async (req: Request, res: Response) => {
  // FALSE olanlar güncellenmelidir. Yoksa karışıklık olur.
  try {
    const user = res.locals.user.id;
    const { id } = req.params;
    const { name, description, amount } = req.body;
    const result = await Outgoings.findOneAndUpdate(
      {
        _id: toid(id),
        user: toid(user),
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
    return res.json({ error: 'Gider kaydı güncellenemedi.' });
  }
};

const deleteOutgoings = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = res.locals.user.id;
  try {
    const result = await Outgoings.findOneAndDelete({ _id: id, user });
    return res.json(result);
  } catch (error) {
    return res.json(error);
  }
};

const setActive = async (req: Request, res: Response) => {
  const id = req.params.id;
  const user = res.locals.user.id;
  try {
    const original = await Outgoings.findOne({
      _id: toid(id),
      user: toid(user),
    });

    if (original) {
      if (original.isActive) {
        // De Active Edilecek.
        const updateActivate = await Outgoings.findOneAndUpdate(
          { _id: original.id, user: original.user },
          { isActive: false },
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

        return res.json({ room: updateRoom, outgoings: updateActivate });
      } else {
        // Active Edilecek.
        const updateActivate = await Outgoings.findOneAndUpdate(
          { _id: original.id, user: original.user },
          { isActive: true },
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

        return res.json({ room: updateRoom, outgoings: updateActivate });
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
  createOutgoings
);
router.get('/:id/:page?', readOutgoings);
router.post(
  '/update/:id',
  v.name,
  v.description,
  v.iAmount,
  v.isError,
  updateOutgoings
);
router.post('/delete/:id', deleteOutgoings);

router.post('/active/:id', setActive);
export default router;
