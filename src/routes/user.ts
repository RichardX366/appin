import { Router } from 'express';
import { fetchUser, fetchUsers } from '../controllers/user';

const userRouter = Router();

userRouter.get('/', fetchUsers);
userRouter.get('/:id', fetchUser);

export default userRouter;
