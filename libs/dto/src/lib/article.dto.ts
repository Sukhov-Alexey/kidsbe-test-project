export type CreateArticleDTO = {
  title: string;
  content: string;
};

export type UpdateArticleDTO = CreateArticleDTO;

export type HistoryItem = {
  editor: string;
  updatedAt: string;
  role: 'USER' | 'ADMIN';
};

export type ArticleDTO = CreateArticleDTO & {
  id: string;
  author: string;
  history: HistoryItem[];
  createdAt: string;
  updatedAt: string;
};
