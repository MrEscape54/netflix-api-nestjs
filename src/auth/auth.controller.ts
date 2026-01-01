import { Body, Controller, Get, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import * as jwtRequestType from './types/jwt-request.type';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) { }

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.auth.signup(dto.email, dto.password);
  }

  @Get('verify')
  verify(@Query('token') token: string) {
    return this.auth.verifyEmail(token);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    const jwtCfg = this.config.get('jwt') as any;
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(body.refreshToken, {
        secret: jwtCfg.refreshSecret,
      });
      return this.auth.refresh(payload.sub, body.refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh');
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  logout(@Req() req: jwtRequestType.JwtRequest) {
    return this.auth.logout(req.user.sub);
  }
}
