import { UserDTO } from '@kidsbe/dto';

const USERS_SERVICE_URL = process.env.USERS_EXCHANGE_URL;
const ADMINS_SERVICE_URL = process.env.ADMINS_EXCHANGE_URL;

type MessageAlive = {
  message: string;
};

export type UserDTOWithRole = UserDTO & {
  role: 'USER' | 'ADMIN';
};

export async function getUsers(ids: string[]): Promise<UserDTOWithRole[]> {
  const idsParam = ids.join(';');

  const usersUrl = `${USERS_SERVICE_URL}/exchange/userslist?ids=${idsParam}`;
  const adminsUrl = `${ADMINS_SERVICE_URL}/exchange/userslist?ids=${idsParam}`;

  const [usersResponse, adminsResponse] = await Promise.allSettled([
    getData<UserDTO[]>(usersUrl),
    getData<UserDTO[]>(adminsUrl),
  ]);
  
  const result = [
    ...(usersResponse.status === 'fulfilled'
      ? usersResponse.value.map((x) => {
          return { ...x, role: 'USER' } as UserDTOWithRole;
        })
      : []),
    ...(adminsResponse.status === 'fulfilled'
      ? adminsResponse.value.map((x) => {
          return { ...x, role: 'ADMIN' } as UserDTOWithRole;
        })
      : []),
  ];

  return result;
}

export async function checkServicesStatuses() {
  const [users, admins] = await Promise.allSettled([
    getData<MessageAlive>(USERS_SERVICE_URL),
    getData<MessageAlive>(ADMINS_SERVICE_URL),
  ]);

  return {
    users: users.status === 'fulfilled',
    admins: admins.status === 'fulfilled',
  };
}

export async function getData<T>(path: string): Promise<T> {
  try {
    const res = await fetch(path);
    if (res.ok) {
      const data = await res.json();
      return data as unknown as T;
    }
    return undefined;
  } catch (e: any) {
    console.log(e);
    throw e;
  }
}
