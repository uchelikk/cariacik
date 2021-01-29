import { Request, Response, NextFunction, Errback } from 'express';

export const Error = (
  err: Errback,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  return res.json({
    err,
  });
};
