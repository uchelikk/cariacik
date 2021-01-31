import { Router, Request, Response } from 'express';

const createOutgoings = (req: Request, res: Response) => {
  console.log(req);
  return res.json({ page: 'Outgoings create' });
};

const readOutgoings = (req: Request, res: Response) => {
  console.log(req);
  return res.json({ page: 'Outgoings read' });
};

const updateOutgoings = (req: Request, res: Response) => {
  console.log(req);
  return res.json({ page: 'Outgoings update' });
};

const deleteOutgoings = (req: Request, res: Response) => {
  console.log(req);
  return res.json({ page: 'Outgoings delete' });
};

const setActive = (req: Request, res: Response) => {
  console.log(req);
  return res.json({ page: 'Outgoings activated' });
};

const router = Router();
router.post('/create', createOutgoings);
router.get('/:id', readOutgoings);
router.post('/update/:id', updateOutgoings);
router.post('/delete/:id', deleteOutgoings);

router.post('/active/:id', setActive);
export default router;
