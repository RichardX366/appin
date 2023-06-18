import Cookies from 'cookies';
import { Request, Response } from 'express';

export const setCookie = (
  req: Request,
  res: Response,
  key: string,
  value: string,
) =>
  new Cookies(req, res, { secure: true }).set(key, value, {
    expires: new Date(Date.now() + 9e10 * 1000),
  });
