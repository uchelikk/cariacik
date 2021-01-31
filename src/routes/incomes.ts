import { Router, Request, Response } from 'express';

const createIncomes = (req: Request, res: Response) => {
  console.log(req);
  return res.json({ page: 'Incomes create' });
};

const readIncomes = (req: Request, res: Response) => {
  console.log(req);
  return res.json({ page: 'Incomes read' });
};

const updateIncomes = (req: Request, res: Response) => {
  console.log(req);
  return res.json({ page: 'Incomes update' });
};

const deleteIncomes = (req: Request, res: Response) => {
  console.log(req);
  return res.json({ page: 'Incomes delete' });
};

const setActive = (req: Request, res: Response) => {
  console.log(req);
  return res.json({ page: 'Incomes activated' });
};

const router = Router();
router.post('/create', createIncomes);
router.get('/:id', readIncomes);
router.post('/update/:id', updateIncomes);
router.post('/delete/:id', deleteIncomes);

router.post('/active/:id', setActive);
export default router;
