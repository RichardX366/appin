import { Router } from 'express';
import { deleteXpUpdate, xpUpdate } from '../controllers/xp';

const xpRouter = Router();

xpRouter.post('/', xpUpdate);
xpRouter.delete('/:id', deleteXpUpdate);

export default xpRouter;
