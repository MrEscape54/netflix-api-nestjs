import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TitleEntity } from '../catalog/entities/title.entity';
import { GenreEntity } from '../catalog/entities/genre.entity';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [TypeOrmModule.forFeature([TitleEntity, GenreEntity])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule { }
