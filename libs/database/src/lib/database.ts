import { InternalServerError } from '@kidsbe/http-errors';
import { Client } from 'pg';

let client: Client | undefined;

export async function getClient() {
  if (!client) {
    try {
      client = new Client({
        host: process.env['DB_HOST'],
        port: process.env['DB_PORT'] ? Number(process.env['DB_PORT']) : 5432,
        user: process.env['DB_USER'],
        password: process.env['DB_PASSWORD'],
        database: process.env['DB_NAME'],
      });
      await client.connect();
    } catch (e: any) {
      client = undefined;
      throw new InternalServerError(e);
    }
  }

  return client;
}
