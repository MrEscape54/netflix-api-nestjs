/* // src/catalog/seed/catalog-seed.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TitleEntity } from '../entities/title.entity';
import { GenreEntity } from '../entities/genre.entity';

@Injectable()
export class CatalogSeedService implements OnModuleInit {
  private readonly logger = new Logger(CatalogSeedService.name);

  constructor(
    @InjectRepository(TitleEntity)
    private readonly titlesRepo: Repository<TitleEntity>,
    @InjectRepository(GenreEntity)
    private readonly genresRepo: Repository<GenreEntity>,
  ) { }

  async onModuleInit() {
    const count = await this.titlesRepo.count();
    if (count > 0) {
      this.logger.log(`Seed skipped (titles already exist: ${count})`);
      return;
    }

    this.logger.log('Seeding catalog...');

    const [action, drama, scifi] = await this.ensureGenres([
      'Action',
      'Drama',
      'Sci-Fi',
    ]);

    const titles: Partial<TitleEntity>[] = [
      {
        name: 'The Sample Movie',
        type: 'movie',
        year: 2025,
        description: 'A demo movie to validate catalog + playback.',
        ageRating: 'PG-13',
        posterUrl: 'https://picsum.photos/300/450?random=1',
        backdropUrl: 'https://picsum.photos/1200/500?random=11',
        playbackHlsUrl: 'http://localhost:8080/hls/master.m3u8', // add later
        featured: true,
        genres: [action, scifi],
      },
      {
        name: 'The Sample Series',
        type: 'series',
        year: 2024,
        description: 'A demo series to validate browsing and details.',
        ageRating: 'TV-MA',
        posterUrl: 'https://picsum.photos/300/450?random=2',
        backdropUrl: 'https://picsum.photos/1200/500?random=12',
        playbackHlsUrl: 'http://localhost:8080/hls/master.m3u8',
        featured: false,
        genres: [drama],
      },
    ];

    for (const t of titles) {
      const entity = this.titlesRepo.create(t);
      await this.titlesRepo.save(entity);
    }

    this.logger.log('Seed completed.');
  }

  private async ensureGenres(names: string[]) {
    const out: GenreEntity[] = [];
    for (const name of names) {
      let g = await this.genresRepo.findOne({ where: { name } });
      if (!g) {
        g = this.genresRepo.create({ name });
        g = await this.genresRepo.save(g);
      }
      out.push(g);
    }
    return out;
  }
}
 */