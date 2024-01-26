/*!!! THIS ENDPOINTS MUST NOT BE EXPOSED TO THE PUBLIC INTERNET !!!*/

import { Request, Response, NextFunction, Router } from 'express';
import { BadRequestError, exceptionWrapper } from '@kidsbe/http-errors';
import { ExchangeService } from './exchange.service';

export const router = Router();

const service = new ExchangeService();

//@ts-ignore
router.get(
  '/exchange/userslist',
  //@ts-ignore
  (req: Request, res: Response, next: NextFunction) => {
    exceptionWrapper(next, async () => {
      const idsParam = req.query['ids'] as string;
      if (!req.query['ids']) {
        throw new BadRequestError('Request must includes ids list in params');
      }

      const users = await service.getUsersListByIds(idsParam.split(';'));
      res.send(users);
    });
  }
);
