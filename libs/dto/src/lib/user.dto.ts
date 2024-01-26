export type UserBaseDTO = {
  firstName: string;
  lastName: string;
  email: string;
};

export type UserDTO = UserBaseDTO & {
  id: string;
};

export type CreateUserDTO = UserBaseDTO & {
  password: string;
};
