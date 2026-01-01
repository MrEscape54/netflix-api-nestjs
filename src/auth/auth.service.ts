/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, IsNull, Repository } from 'typeorm';
import { AccountEntity } from './entities/account.entity';
import { EmailVerificationTokenEntity } from './entities/email-verification-token.entity';
import { MailService } from 'src/mail/mail.service';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(AccountEntity) private readonly accounts: Repository<AccountEntity>,
    @InjectRepository(EmailVerificationTokenEntity) private readonly tokens: Repository<EmailVerificationTokenEntity>,
    private readonly mail: MailService,
  ) { }

  async signup(emailRaw: string, password: string) {
    const email = emailRaw.trim().toLowerCase();

    const existing = await this.accounts.findOne({ where: { email } });
    if (existing) {
      // Netflix-like: no revelar si existe; pero para dev está ok un mensaje claro.
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const account = await this.accounts.save(
      this.accounts.create({
        email,
        passwordHash,
        status: 'PENDING',
        emailVerifiedAt: null,
      }),
    );

    // create token (store only hash)
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    await this.tokens.save(
      this.tokens.create({
        account,
        tokenHash,
        expiresAt,
        usedAt: null,
      }),
    );

    const publicUrl = this.config.get<string>('APP_PUBLIC_URL') || 'http://localhost:3000';
    const verifyUrl = `${publicUrl}/verify?token=${encodeURIComponent(token)}`;

    await this.mail.sendVerificationEmail(email, verifyUrl);

    return { ok: true };
  }

  async verifyEmail(token: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const record = await this.tokens.findOne({
      where: {
        tokenHash,
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      relations: { account: true },
    });

    if (!record) {
      throw new BadRequestException('Invalid or expired token');
    }

    // mark used
    record.usedAt = new Date();
    await this.tokens.save(record);

    // activate account
    record.account.status = 'ACTIVE';
    record.account.emailVerifiedAt = new Date();
    await this.accounts.save(record.account);

    return { ok: true };
  }

  async validateLogin(emailRaw: string, password: string) {
    const email = emailRaw.trim().toLowerCase();
    const account = await this.accounts.findOne({ where: { email } });
    if (!account) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, account.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    if (account.status !== 'ACTIVE') {
      throw new UnauthorizedException('Email not verified');
    }

    return account;
  }

  async login(email: string, password: string) {
    const account = await this.validateLogin(email, password);

    const { accessToken, refreshToken } = await this.issueTokens(account);

    // store refresh hash
    account.refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    await this.accounts.save(account);

    return { accessToken, refreshToken };
  }

  async refresh(accountId: string, refreshToken: string) {
    const account = await this.accounts.findOne({ where: { id: accountId } });
    if (!account || !account.refreshTokenHash) throw new UnauthorizedException('Invalid refresh');

    const ok = await bcrypt.compare(refreshToken, account.refreshTokenHash);
    if (!ok) throw new UnauthorizedException('Invalid refresh');

    const { accessToken, refreshToken: newRefresh } = await this.issueTokens(account);

    // rotate refresh token
    account.refreshTokenHash = await bcrypt.hash(newRefresh, 12);
    await this.accounts.save(account);

    return { accessToken, refreshToken: newRefresh };
  }

  async refreshFromToken(refreshToken: string) {
    const jwtCfg = this.config.get<{ refreshSecret: string }>('jwt')!;
    let payload: { sub: string };

    try {
      payload = await this.jwt.verifyAsync<{ sub: string }>(refreshToken, { secret: jwtCfg.refreshSecret });
    } catch {
      throw new UnauthorizedException('Invalid refresh');
    }

    return this.refresh(payload.sub, refreshToken);
  }

  async logout(accountId: string) {
    await this.accounts.update({ id: accountId }, { refreshTokenHash: null });
    return { ok: true };
  }

  private async issueTokens(account: AccountEntity) {
    const jwtCfg = this.config.get('jwt');

    const accessToken = await this.jwt.signAsync(
      { sub: account.id, email: account.email, role: account.role },
      { secret: jwtCfg.accessSecret, expiresIn: jwtCfg.accessExpiresIn },
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: account.id }, // keep refresh minimal
      { secret: jwtCfg.refreshSecret, expiresIn: jwtCfg.refreshExpiresIn },
    );

    return { accessToken, refreshToken };
  }
}
