import { UserDTO } from '@kidsbe/dto';

export function toUserDTO(userRecord: any): UserDTO {
    return {
        id: userRecord.id,
        firstName: userRecord.first_name,
        lastName: userRecord.last_name,
        email: userRecord.email,
      };
}