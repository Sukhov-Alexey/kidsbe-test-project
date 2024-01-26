import {
  ArticleDTO,
  CreateArticleDTO,
  HistoryItem,
  UpdateArticleDTO,
} from '@kidsbe/dto';
import { getClient } from '@kidsbe/database';
import { ForbiddenError, NotFoundError } from '@kidsbe/http-errors';
import { HistoryService } from '../history/history.service';
import { UserDTOWithRole, getUsers } from '../utils/exchange.utils';
import { query } from 'express';

export class ArticlesService {
  private findArticlesRequest = `SELECT art.id, title, content, author_id, art.created_at, art.updated_at, array_agg(row_to_json(eh)) as history
  FROM public.articles art
  LEFT JOIN public.edits_history eh
    ON art.id = eh.article_id
  GROUP BY art.id
  ORDER BY art.created_at DESC
  LIMIT $2 OFFSET $1;
  `;

  private findOneArticleRequest = `SELECT art.id, title, content, author_id, art.created_at, art.updated_at, array_agg(row_to_json(eh)) as history
  FROM public.articles art
  LEFT JOIN public.edits_history eh
    ON art.id = eh.article_id
  WHERE art.id::text = $1
  GROUP BY art.id;
  `;

  private createArticleRequest = `INSERT INTO public.articles(author_id, title, content)
  VALUES($1, $2, $3)
  RETURNING *;`;

  private updateArticleRequest = `UPDATE public.articles
  SET title = $2, content = $3
  WHERE id = $1;`;

  private deleteArticleRequest = `DELETE FROM public.articles
  WHERE id = $1;`;

  private historyService: HistoryService;

  constructor() {
    this.historyService = new HistoryService();
  }

  async getArticles(page: number, count: number): Promise<ArticleDTO[]> {
    const client = await getClient();
    const articlesResponse = await client.query(this.findArticlesRequest, [
      page,
      count,
    ]);

    const usersIds = [];
    const articleConverters = [];

    for (const row of articlesResponse.rows) {
      const { ids, convert } = this.useArticleConverter(row);
      usersIds.push(...ids);
      articleConverters.push(convert);
    }

    const usersIdsSet = new Set<string>(usersIds);
    const users = await getUsers([...usersIdsSet]);

    return articleConverters.map((x) => x(users));
  }

  async getArticle(id: string): Promise<ArticleDTO> {
    const client = await getClient();
    const articleResponse = await client.query(this.findOneArticleRequest, [
      id,
    ]);
    if (!articleResponse.rows[0]) {
      throw new NotFoundError(`Article ${id} not found`);
    }

    const { ids, convert } = this.useArticleConverter(articleResponse.rows[0]);
    const users = await getUsers(ids);

    return convert(users);
  }

  async createArticle(newArticle: CreateArticleDTO, userId: string) {
    const client = await getClient();
    const createArticleResponse = await client.query(
      this.createArticleRequest,
      [userId, newArticle.title, newArticle.content]
    );

    return await this.getArticle(createArticleResponse.rows[0].id);
  }

  async updateArticle(
    id: string,
    update: UpdateArticleDTO,
    actorId: string,
    isAdmin: boolean
  ): Promise<ArticleDTO> {
    const client = await getClient();
    const articleResponse = await client.query(this.findOneArticleRequest, [id]);

    if (articleResponse.rowCount < 1) {
      throw new NotFoundError(`Article with id: ${id} not found`);
    }

    const article = articleResponse.rows[0];
    const isUpdateAllowed = isAdmin || actorId === article.author_id;

    if (!isUpdateAllowed) {
      throw new ForbiddenError(`User ${actorId} attempts update article ${id}`);
    }

    
    await this.historyService.addRecord(id, actorId);
    await client.query(this.updateArticleRequest, [
      id,
      update.title,
      update.content,
    ]);

    return await this.getArticle(id);
  }

  async deleteArticle(id: string, actorId: string, isAdmin: boolean) {
    const article = await this.getArticle(id);
    const isAllowed = isAdmin || actorId === article.author;

    if (!isAllowed) {
      throw new ForbiddenError(`User ${actorId} attempts delete article ${id}`);
    }

    const client = await getClient();
    await client.query(this.deleteArticleRequest, [id]);
  }

  private useArticleConverter(articleRaw: any): {
    ids: string[];
    convert: (user: UserDTOWithRole[]) => ArticleDTO;
  } {
    const matchIdWithUser = (id: string, users: UserDTOWithRole[]) => {
      const user = users.find((x) => x.id === id);
      return {
        name: user ? [user.firstName, user.lastName].join(' ') : '',
        role: user ? user.role : 'USER',
      };
    };

    return {
      convert: (users: UserDTOWithRole[]) => {
        const convertToHistory = (historyRaw: any): HistoryItem => {
          const match = matchIdWithUser(historyRaw.editor_id, users);
          return {
            editor: match.name,
            role: match.role,
            updatedAt: historyRaw.created_at,
          } as HistoryItem;
        };

        const authorMatch = matchIdWithUser(articleRaw.author_id, users);
        return {
          id: articleRaw.id,
          author: authorMatch.name,
          content: articleRaw.content,
          title: articleRaw.title,
          history: articleRaw.history
            ? articleRaw.history
                .filter((x) => !!x)
                .map((x: any) => convertToHistory(x))
            : [],
          createdAt: articleRaw.created_at.toISOString(),
          updatedAt: articleRaw.updated_at.toISOString(),
        } as ArticleDTO;
      },
      ids: [
        articleRaw.id,
        ...(articleRaw.history
          ? articleRaw.history.filter((x) => !!x).map((x: any) => x.editor_id)
          : []),
      ],
    };
  }
}
