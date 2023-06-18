import { Router } from 'express';
import {
  logIn,
  signUp,
  updateAuthLevel,
  updatePassword,
  updateUser,
} from '../controllers/auth';

const authRouter = Router();

authRouter.post('/login', logIn);
authRouter.post('/signUp', signUp);
authRouter.put('/:id', updateUser);
authRouter.put('/updatePassword/:id', updatePassword);
authRouter.put('/authLevel/:id', updateAuthLevel);

export default authRouter;
