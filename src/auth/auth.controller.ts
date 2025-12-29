import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) { }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.email, dto.password);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    const jwtCfg = this.config.get('jwt');
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(body.refreshToken, {
        secret: jwtCfg.refreshSecret,
      });
      return this.auth.refresh(payload.sub, body.refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh');
    }
  }

  @Post('logout')
  logout(@Body() body: { userId: string }) {
    return this.auth.logout(body.userId);
  }
}