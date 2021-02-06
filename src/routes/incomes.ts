import { Router, Request, Response } from 'express';
import Timelanes, { TimelaneTYPE } from '../schema/timelanes';
import * as v from '../utils/validations';
import toid from '../utils/id';
import Room from '../schema/rooms';

const createTimelanes = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user.id;
    const { room, name, description, amount } = req.body;
    const timelanes = new Timelanes({
      name,
      description,
      amount,
      type: TimelaneTYPE.INCOME,
      room,
      user,
    });
    const result = await timelanes.save();
    return res.json(result);
  } catch (error) {
    return res.json({ error: 'Gelir kaydı oluşturulamadı.' });
  }
};

const updateTimelanes = async (req: Request, res: Response) => {
  // FALSE olanlar güncellenmelidir. Yoksa karışıklık olur.
  try {
    const user = res.locals.user.id;
    const { id } = req.params;
    const { name, description, amount } = req.body;
    const result = await Timelanes.findOneAndUpdate(
      {
        _id: toid(id),
        user: toid(user),
        active: false,
        type: TimelaneTYPE.INCOME,
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

const readTimelanes = async (req: Request, res: Response) => {
  const { id, page } = req.params;
  const LIMIT = 30;
  const PAGE: number =
    page === 'undefined' ? 0 : parseInt(page) > 0 ? parseInt(page) - 1 : 0;

  const timelanes = await Timelanes.find({
    room: toid(id),
    type: TimelaneTYPE.INCOME,
  })
    .sort({ updatedAt: -1 })
    .limit(LIMIT)
    .skip(LIMIT * PAGE)
    .populate('user');

  return res.json(timelanes);
};

const deleteTimelanes = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = res.locals.user.id;
  try {
    const result = await Timelanes.findOneAndDelete({
      _id: id,
      user,
      type: TimelaneTYPE.INCOME,
    });
    return res.json(result);
  } catch (error) {
    return res.json(error);
  }
};

const setActive = async (req: Request, res: Response) => {
  const id = req.params.id;
  const user = res.locals.user.id;
  try {
    const original = await Timelanes.findOne({
      _id: toid(id),
      user: toid(user),
      type: TimelaneTYPE.INCOME,
    });

    if (original) {
      if (original.active) {
        // De Active Edilecek.
        const updateActivate = await Timelanes.findOneAndUpdate(
          { _id: original.id, user: original.user, type: TimelaneTYPE.INCOME },
          { active: false },
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

        return res.json({ room: updateRoom, income: updateActivate });
      } else {
        // Active Edilecek.
        const updateActivate = await Timelanes.findOneAndUpdate(
          { _id: original.id, user: original.user, type: TimelaneTYPE.INCOME },
          { active: true },
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

        return res.json({ room: updateRoom, income: updateActivate });
      }
    } else {
      return res.json([]);
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
  createTimelanes
);
router.get('/:id/:page?', readTimelanes);
router.post(
  '/update/:id',
  v.name,
  v.description,
  v.iAmount,
  v.isError,
  updateTimelanes
);
router.post('/delete/:id', deleteTimelanes);

router.post('/active/:id', setActive);
export default router;
