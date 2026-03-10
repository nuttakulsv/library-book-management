import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthUser } from '../../common/types/request.types';
import { User } from '../../entities/user.entity';

export interface JwtPayload {
  sub: number;
  username: string;
  isAdministration: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => (req?.query?.token as string) ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'book-library-secret-change-in-production',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      select: ['id', 'memberId', 'username', 'email', 'isAdministration', 'createdAt'],
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (!user.memberId) {
      user.memberId = `M${Date.now().toString(36).toUpperCase().slice(-6)}`;
      await this.userRepository.save(user);
    }
    return {
      id: user.id,
      memberId: user.memberId,
      username: user.username,
      email: user.email,
      isAdministration: user.isAdministration,
      createdAt: user.createdAt,
    };
  }
}
