import { Router, Request, Response } from 'express';
import * as v from '../utils/validations';
import Timelanes, { TimelaneTYPE } from '../schema/timelanes';
import toid from '../utils/id';
import Room from '../schema/rooms';

const createtimelanes = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user.id;
    const { room, name, description, amount } = req.body;
    const timelanes = new Timelanes({
      name,
      description,
      amount,
      room,
      user,
      type: TimelaneTYPE.OUTGOING,
    });
    const result = await timelanes.save();
    return res.json(result);
  } catch (error) {
    return res.json({ error: 'Gider kaydı oluşturulamadı.' });
  }
};

const readtimelanes = async (req: Request, res: Response) => {
  const { id, page } = req.params;
  const LIMIT = 30;
  const PAGE: number =
    page === 'undefined' ? 0 : parseInt(page) > 0 ? parseInt(page) - 1 : 0;

  const timelanes = await Timelanes.find({
    room: toid(id),
    type: TimelaneTYPE.OUTGOING,
  })
    .sort({ updatedAt: -1 })
    .limit(LIMIT)
    .skip(LIMIT * PAGE)
    .populate('user');

  return res.json(timelanes);
};

const updatetimelanes = async (req: Request, res: Response) => {
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
        type: TimelaneTYPE.OUTGOING,
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

const deletetimelanes = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = res.locals.user.id;
  try {
    const result = await Timelanes.findOneAndDelete({
      _id: id,
      user,
      type: TimelaneTYPE.OUTGOING,
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
      type: TimelaneTYPE.OUTGOING,
    });

    if (original) {
      if (original.active) {
        // De Active Edilecek.
        const updateActivate = await Timelanes.findOneAndUpdate(
          {
            _id: original.id,
            user: original.user,
            type: TimelaneTYPE.OUTGOING,
          },
          { active: false },
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

        return res.json({ room: updateRoom, outgoing: updateActivate });
      } else {
        // Active Edilecek.
        const updateActivate = await Timelanes.findOneAndUpdate(
          {
            _id: original.id,
            user: original.user,
            type: TimelaneTYPE.OUTGOING,
          },
          { active: true },
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

        return res.json({ room: updateRoom, outgoing: updateActivate });
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
  createtimelanes
);
router.get('/:id/:page?', readtimelanes);
router.post(
  '/update/:id',
  v.name,
  v.description,
  v.iAmount,
  v.isError,
  updatetimelanes
);
router.post('/delete/:id', deletetimelanes);

router.post('/active/:id', setActive);
export default router;
