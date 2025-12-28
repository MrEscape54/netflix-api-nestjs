import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TitleEntity } from '../catalog/entities/title.entity';
import { PlaybackController } from './playback.controller';
import { PlaybackService } from './playback.service';

@Module({
  imports: [TypeOrmModule.forFeature([TitleEntity])],
  controllers: [PlaybackController],
  providers: [PlaybackService],
})
export class PlaybackModule { }
