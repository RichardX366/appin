import { Router } from 'express';
import { fetchUser } from '../controllers/user';

const userRouter = Router();

userRouter.get('/:id', fetchUser);

export default userRouter;
