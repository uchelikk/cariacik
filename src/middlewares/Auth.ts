import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const Auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isValid = jwt.verify(req.session.user, process.env.JWT_SECRET!);

    if (isValid) { 
      const user = jwt.decode(req.session.user);
      res.locals.user = user;
      return next();
    } else {
      res.locals.user = undefined;
      return next('Not login');
    }
  } catch (error) {
    next(error);
  }
};
