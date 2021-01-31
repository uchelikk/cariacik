import { Request, Response, NextFunction } from 'express';
import { check, validationResult } from 'express-validator';

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

export const isError = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
};
