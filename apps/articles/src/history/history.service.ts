import { getClient } from '@kidsbe/database';
import { HistoryDTO } from '@kidsbe/dto';

export class HistoryService {
  private createRecordRequest = `INSERT INTO public.edits_history(article_id, editor_id)
  VALUES($1, $2)
  RETURNING *;`;

  async addRecord(articleId: string, editorId: string): Promise<HistoryDTO> {
    const client = await getClient();
    const resp = await client.query(this.createRecordRequest, [articleId, editorId]);
    return this.toHistoryDTO(resp.rows[0]);
  }

  private toHistoryDTO(rawRecord: any): HistoryDTO {
    return {
        id: rawRecord.id,
        articleId: rawRecord.article_id,
        editorId: rawRecord.editor_id,
        createdAt: rawRecord.created_at.toISOString()
    } as HistoryDTO;
  }
}
