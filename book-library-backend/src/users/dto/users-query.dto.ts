import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

/** Query DTO สำหรับ GET /users - ใช้ q สำหรับ search (alias ของ search) */
export class UsersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;
}
