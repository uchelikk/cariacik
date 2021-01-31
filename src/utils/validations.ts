import { Request, Response, NextFunction } from 'express';
import { check, validationResult } from 'express-validator';

export const mail = check('email', 'Hatalı mail adresi')
  .isEmail()
  .normalizeEmail();

export const age = check('age', 'Yaş rakam olmalıdır').isNumeric();

export const isError = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
};
