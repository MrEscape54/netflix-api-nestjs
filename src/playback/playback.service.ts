import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TitleEntity } from '../catalog/entities/title.entity';

@Injectable()
export class PlaybackService {
  constructor(
    @InjectRepository(TitleEntity)
    private readonly titlesRepo: Repository<TitleEntity>,
  ) { }

  async getPlaybackUrl(titleId: string) {
    const title = await this.titlesRepo.findOne({ where: { id: titleId } });
    if (!title) throw new NotFoundException('Title not found');

    if (!title.playbackHlsUrl) {
      throw new ForbiddenException(
        'Title is not playable yet (missing playbackHlsUrl)',
      );
    }

    return {
      titleId: title.id,
      playbackUrl: title.playbackHlsUrl,
      type: 'hls' as const,
    };
  }
}
