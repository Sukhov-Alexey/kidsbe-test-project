import { exceptionWrapper } from '@kidsbe/http-errors';
import { Router, Request, Response, NextFunction } from 'express';
import { ArticlesService } from './articles.service';
import { CreateArticleDTO, UpdateArticleDTO } from '@kidsbe/dto';
import { authorizedMiddleware } from '@kidsbe/auth-utils';

export const router = Router({});
const service = new ArticlesService();

router.get('/articles', (req: Request, res: Response, next: NextFunction) => {
  exceptionWrapper(next, async () => {
    const page = req.query.page ? Number(req.query.page) : 0;
    const perPage = req.query.perPage ? Number(req.query.perPage) : 10;

    const articles = await service.getArticles(page, perPage);
    res.send(articles);
  });
});

router.get(
  '/articles/:id',
  (req: Request, res: Response, next: NextFunction) => {
    exceptionWrapper(next, async () => {
      const id = req.params.id;
      const article = await service.getArticle(id);
      res.send(article);
    });
  }
);

router.post(
  '/articles',
  authorizedMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    exceptionWrapper(next, async () => {
      const articleRequest = req.body as CreateArticleDTO;
      const userId = res.locals.userId;
      const article = await service.createArticle(articleRequest, userId);
      res.send(article);
    });
  }
);

router.put(
  '/articles/:id',
  authorizedMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    exceptionWrapper(next, async () => {
      const update = req.body as UpdateArticleDTO;
      const articleId = req.params.id;
      const updaterId = res.locals.userId;
      const isAdmin = res.locals.isAdmin;

      const updatedArticle = await service.updateArticle(
        articleId,
        update,
        updaterId,
        isAdmin
      );
      res.send(updatedArticle);
    });
  }
);

router.delete(
  '/articles/:id',
  authorizedMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    exceptionWrapper(next, async () => {
      const articleId = req.params.id;
      const actorId = res.locals.userId;
      const isAdmin = res.locals.isAdmin;

      await service.deleteArticle(articleId, actorId, isAdmin);
      res.sendStatus(200);
    })
  }
)
