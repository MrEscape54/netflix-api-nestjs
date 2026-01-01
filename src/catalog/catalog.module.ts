import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedTmdbService } from './seed/seed-tmdb.service';
import { GenreEntity } from './entities/genre.entity';
import { TitleEntity } from './entities/title.entity';
import { CatalogController } from './catalog.controller';
import { SeedController } from './seed/seed.controller';
import { TmdbService } from './tmdb/tmdb.service';
import { CatalogService } from './catalog.service';

@Module({
  imports: [TypeOrmModule.forFeature([TitleEntity, GenreEntity])],
  providers: [TmdbService, SeedTmdbService, CatalogService],
  controllers: [SeedController, CatalogController],
})
export class CatalogModule { }
