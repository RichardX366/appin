import express from 'express';
import { PrismaClient } from '@prisma/client';
import attachMiddleware from 'rx-express-middleware';
import './types';

export const app = express();
attachMiddleware(app);
export const prisma = new PrismaClient();

import baseRouter from './routes';

app.use(baseRouter);

app.listen(process.env.PORT || 3005, () =>
  console.log(
    `🚀 Server ready at: http://localhost:${process.env.PORT || 3005}`,
  ),
);
