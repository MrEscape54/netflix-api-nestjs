import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogService } from './catalog.service';
import { GenreEntity } from './entities/genre.entity';
import { TitleEntity } from './entities/title.entity';
import { CatalogController } from './catalog.controller';
import { CatalogSeedService } from './seed/catalog-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([TitleEntity, GenreEntity])],
  providers: [CatalogService, CatalogSeedService],
  controllers: [CatalogController],
})
export class CatalogModule { }
