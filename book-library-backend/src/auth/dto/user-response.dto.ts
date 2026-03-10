export interface UserResponseDto {
  id: number;
  memberId?: string;
  username: string;
  email?: string;
  isAdministration: boolean;
  createdAt: string;
}
