import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AccountEntity } from './entities/account.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerificationTokenEntity } from './entities/email-verification-token.entity';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    MailModule,
    TypeOrmModule.forFeature([AccountEntity, EmailVerificationTokenEntity]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        type JwtCfg = { accessSecret: string; accessExpiresIn: string };
        const jwt = config.get<JwtCfg>('jwt', { infer: true })!;
        return {
          secret: jwt.accessSecret,
          signOptions: { expiresIn: jwt.accessExpiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule { }
