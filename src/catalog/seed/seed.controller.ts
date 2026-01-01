import { Controller, Post } from '@nestjs/common';
import { SeedTmdbService } from './seed-tmdb.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seed: SeedTmdbService) { }

  @Post('tmdb')
  run() {
    return this.seed.seed({ movies: 20, series: 20 });
  }
}
