import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { ISession } from './interfaces/session.interface';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('session')
  @UseGuards(JwtAuthGuard)
  async getSession(@Req() req: Request): Promise<ISession> {
    const user = req.user;
    if (!user) throw new UnauthorizedException('User not found');
    const { id, memberId, username, email, isAdministration, createdAt } = user;
    return {
      id,
      memberId,
      username,
      email,
      isAdministration,
      createdAt: createdAt.toISOString(),
    };
  }

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout() {
    await this.authService.logout();
    return { message: 'Logged out successfully' };
  }
}
