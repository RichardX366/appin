import { Router } from 'express';
import authRouter from './auth';
import xpRouter from './xp';
import userRouter from './user';

const baseRouter = Router();

baseRouter.get('/', (req, res) => {
  res.send('Everything works fine.');
});

baseRouter.use('/auth', authRouter);
baseRouter.use('/xp', xpRouter);
baseRouter.use('/user', userRouter);
baseRouter.get('/cookies', (req, res) => res.json(req.cookies)); // IMPORTANT: REMOVE IN PRODUCTION; DEBUG ROUTE

export default baseRouter;
