import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4, { message: 'รหัสผ่านอย่างน้อย 4 ตัวอักษร' })
  password: string;
}
