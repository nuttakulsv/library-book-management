import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type * as ms from 'ms';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import type { AuthUser } from '../common/types/request.types';
import { User } from '../entities/user.entity';
import type { AuthResponseDto } from './dto/auth-response.dto';
import type { UserResponseDto } from './dto/user-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';


function toUserResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    memberId: user.memberId,
    username: user.username,
    email: user.email,
    isAdministration: user.isAdministration,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : (user.createdAt ?? ''),
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.userRepository.findOne({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException('Username already exists');
    }
    const memberId = this.generateMemberId();
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      memberId,
      username: dto.username,
      password: hashedPassword,
    });
    const saved = await this.userRepository.save(user);
    const token = this.signToken(saved);
    return { token, user: toUserResponseDto(saved) };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOne({
      where: [
        { username: dto.username },
        { email: dto.username },
      ],
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const token = this.signToken(user);
    return { token, user: toUserResponseDto(user) };
  }

  async logout(): Promise<void> {
    // JWT stateless — client ลบ token เอง. Server ไม่ต้องทำอะไร
  }

  private signToken(user: User): string {
    return this.jwtService.sign(
      {
        sub: user.id,
        username: user.username,
        isAdministration: user.isAdministration,
      },
      { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as ms.StringValue },
    );
  }

  async validateToken(token: string): Promise<AuthUser | undefined> {
    try {
      const payload = this.jwtService.verify<{
        sub: number;
        username: string;
        isAdministration: boolean;
      }>(token);
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        select: ['id', 'memberId', 'username', 'email', 'isAdministration', 'createdAt'],
      });
      if (!user) return undefined;
      return {
        id: user.id,
        memberId: user.memberId,
        username: user.username,
        email: user.email,
        isAdministration: user.isAdministration,
        createdAt: user.createdAt ?? new Date(),
      };
    } catch {
      return undefined;
    }
  }

  private generateMemberId(): string {
    const prefix = 'M';
    const num = Date.now().toString(36).toUpperCase().slice(-6);
    const rand = randomBytes(2).toString('hex').toUpperCase();
    return `${prefix}${num}${rand}`;
  }
}
