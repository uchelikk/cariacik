import { Router, Request, Response } from 'express';
import Incomes from '../schema/incomes';

const createIncomes = async (req: Request, res: Response) => {
  const user = res.locals.user;
  const { room, name, description, amount } = req.body;
  const incomes = new Incomes({ name, description, amount, room, user });
  const result = incomes.save();
  return res.json(result);
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
