import { NextFunction, Request, Response, Router } from 'express';
import { LoginService } from './login.service';
import { CreateUserDTO, CredentialsDTO } from '@kidsbe/dto';
import { exceptionWrapper } from '@kidsbe/http-errors';

const service = new LoginService();
export const router = Router();

//@ts-ignore
router.post('/sign-up', (req: Request, res: Response, next: NextFunction) => {
  exceptionWrapper(next, async () => {
    const userDTO = req.body as CreateUserDTO;
    const user = await service.createUser(userDTO);
    res.send(user);
  });
});

//@ts-ignore
router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  exceptionWrapper(next, async () => {
    const creds = req.body as CredentialsDTO;
    res.send(await service.login(creds));
  });
});

//@ts-ignore
router.put('/login', (req: Request, res: Response, next: NextFunction) => {
  exceptionWrapper(next, async () => {
    const { refreshToken } = req.body;
    res.send(await service.rotate(refreshToken));
  });
});
