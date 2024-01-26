import { UserDTO } from '@kidsbe/dto';
import { getClient } from '@kidsbe/database';
import { toUserDTO } from '../utils';

export class ExchangeService {
  private getUsersList = `SELECT * from public.users
    WHERE id = ANY($1::uuid[]);`;

  async getUsersListByIds(ids: string[]): Promise<UserDTO[]> {
    const client = await getClient();
    const usersResponse = await client.query(this.getUsersList, [ids]);
    return usersResponse.rows.map((x) => toUserDTO(x));
  }
}
