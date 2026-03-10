import type { UserResponseDto } from './user-response.dto';

export interface AuthResponseDto {
  token: string;
  user: UserResponseDto;
}
