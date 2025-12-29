/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(UserEntity) private readonly usersRepo: Repository<UserEntity>,
  ) { }

  async register(email: string, password: string) {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.users.createUser({ email, passwordHash });

    return { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt };
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const { accessToken, refreshToken } = await this.issueTokens(user);

    // store refresh hash
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    await this.usersRepo.save(user);

    return { accessToken, refreshToken };
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException('Invalid refresh');

    const ok = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!ok) throw new UnauthorizedException('Invalid refresh');

    const { accessToken, refreshToken: newRefresh } = await this.issueTokens(user);

    // rotate refresh token
    user.refreshTokenHash = await bcrypt.hash(newRefresh, 12);
    await this.usersRepo.save(user);

    return { accessToken, refreshToken: newRefresh };
  }

  async logout(userId: string) {
    await this.usersRepo.update({ id: userId }, { refreshTokenHash: null });
    return { ok: true };
  }

  private async issueTokens(user: UserEntity) {
    const jwtCfg = this.config.get('jwt');

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      { secret: jwtCfg.accessSecret, expiresIn: jwtCfg.accessExpiresIn },
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: user.id }, // keep refresh minimal
      { secret: jwtCfg.refreshSecret, expiresIn: jwtCfg.refreshExpiresIn },
    );

    return { accessToken, refreshToken };
  }
}
