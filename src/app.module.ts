/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HealthController } from './health.controller';

import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { PlaybackModule } from './playback/playback.module';
import { SearchModule } from './search/search.module';
import { TitleEntity } from './catalog/entities/title.entity';
import { GenreEntity } from './catalog/entities/genre.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], }),

    TypeOrmModule.forFeature([TitleEntity, GenreEntity]),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db = config.get('database');
        return {
          type: 'postgres',
          host: db.host,
          port: db.port,
          username: db.user,
          password: db.password,
          database: db.name,
          autoLoadEntities: true,
          synchronize: true, // dev only
        };
      },
    }),

    AuthModule,
    CatalogModule,
    PlaybackModule,
    SearchModule,
  ],
  controllers: [HealthController],
})
export class AppModule { }
