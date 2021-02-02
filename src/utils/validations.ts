import { Request, Response, NextFunction } from 'express';
import { check, validationResult } from 'express-validator';
import Room from '../schema/rooms';

/* Users */
export const email = check('email', 'Hatalı mail adresi')
  .isEmail()
  .normalizeEmail();

export const fullName = check('fullName')
  .isLength({ min: 3 })
  .withMessage('En az 2 karakterden oluşmalıdır.')
  .isLength({ max: 120 })
  .withMessage('Fazla uzun');

export const password = check('password')
  .isLength({ min: 6 })
  .withMessage('En az 6 karakterden oluşmalıdır.')
  .isLength({ max: 120 })
  .withMessage('Fazla uzun');

/* Room */
export const name = check('name')
  .isLength({ min: 2 })
  .withMessage('En az 2 karakterden oluşmalıdır.')
  .isLength({ max: 100 })
  .withMessage('Fazla uzun');

export const description = check('description')
  .isLength({ max: 150 })
  .withMessage('Fazla uzun');

export const amount = check('amount')
  .isNumeric()
  .withMessage('Miktar rakam olmalıdır.');

export const roomCode = check('roomCode')
  .isLength({ min: 8, max: 8 })
  .withMessage('Davetiye kodu 8 karakterden oluşmalıdır.');

/* Incomes - Outcomes */
export const isRoomMember = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await check('room')
      .custom(async () => {
        const user = res.locals.user.id;
        const room = req.body.room;
        const result = await Room.findOne({
          _id: room,
          $or: [{ roomOwner: user }, { users: { $in: user } }],
        });

        if (!result) return Promise.reject('Not authorized!');
        else return Promise.resolve(true);
      })
      .run(req);

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    } else {
      return res.status(400).json({ errors: errors.array() });
    }
  };
};

export const isError = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
};
