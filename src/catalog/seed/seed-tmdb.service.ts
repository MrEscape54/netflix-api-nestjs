import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TitleEntity, TitleType } from '../entities/title.entity';
import { GenreEntity } from '../entities/genre.entity';
import { TmdbService } from '../tmdb/tmdb.service';

@Injectable()
export class SeedTmdbService {
  constructor(
    private readonly tmdb: TmdbService,
    @InjectRepository(TitleEntity) private readonly titles: Repository<TitleEntity>,
    @InjectRepository(GenreEntity) private readonly genres: Repository<GenreEntity>,
  ) { }

  async seed({ movies = 20, series = 20 }: { movies?: number; series?: number } = {}) {
    // 1) TMDb images config
    const imgCfg = await this.tmdb.getImageConfig();
    const baseImg: string = imgCfg.images.secure_base_url; // e.g. https://image.tmdb.org/t/p/
    const posterSize = 'w500';
    const backdropSize = 'w780';

    // 2) Genres (movie + tv), dedup by name
    const [movieGenres, tvGenres] = await Promise.all([
      this.tmdb.getMovieGenres(),
      this.tmdb.getTvGenres(),
    ]);

    const allGenres: Array<{ id: number; name: string }> = [
      ...movieGenres.genres,
      ...tvGenres.genres,
    ];

    const genreMap = new Map<number, GenreEntity>();

    for (const g of allGenres) {
      let genre = await this.genres.findOne({ where: { name: g.name } });
      if (!genre) genre = await this.genres.save(this.genres.create({ name: g.name }));
      genreMap.set(g.id, genre);
    }

    // 3) Fetch 2 pages for variety, then slice
    const [m1, m2, s1, s2] = await Promise.all([
      this.tmdb.getPopularMovies(1),
      this.tmdb.getPopularMovies(2),
      this.tmdb.getPopularSeries(1),
      this.tmdb.getPopularSeries(2),
    ]);

    const movieItems = [...m1.results, ...m2.results].slice(0, movies);
    const seriesItems = [...s1.results, ...s2.results].slice(0, series);

    // 4) Upsert by tmdbId (unique)
    await this.importBatch(movieItems, 'movie', baseImg, posterSize, backdropSize, genreMap);
    await this.importBatch(seriesItems, 'series', baseImg, posterSize, backdropSize, genreMap);

    // Optional: mark a few featured (first 4 movies + first 4 series)
    await this.markFeatured(movieItems.slice(0, 4).map((x: any) => x.id), 'movie');
    await this.markFeatured(seriesItems.slice(0, 4).map((x: any) => x.id), 'series');

    return { ok: true, movies: movieItems.length, series: seriesItems.length };
  }

  private async importBatch(
    items: any[],
    type: TitleType,
    baseImg: string,
    posterSize: string,
    backdropSize: string,
    genreMap: Map<number, GenreEntity>,
  ) {
    for (const item of items) {
      const tmdbId: number = item.id;

      // Upsert by tmdbId
      let title = await this.titles.findOne({
        where: { tmdbId },
        relations: { genres: true },
      });

      if (!title) {
        title = this.titles.create({ tmdbId, type });
      }

      title.type = type;
      title.name = item.title || item.name;
      title.description = item.overview ?? null;

      const rawDate = (item.release_date || item.first_air_date || '') as string;
      const yyyy = parseInt(rawDate.slice(0, 4), 10);
      title.year = Number.isFinite(yyyy) ? yyyy : null;

      title.ageRating = null; // TMDb popular endpoints don't include certifications by default

      title.posterUrl = item.poster_path ? `${baseImg}${posterSize}${item.poster_path}` : null;
      title.backdropUrl = item.backdrop_path ? `${baseImg}${backdropSize}${item.backdrop_path}` : null;

      title.playbackHlsUrl = 'http://localhost:8080/hls/master.m3u8';

      // genres from genre_ids
      const ids: number[] = Array.isArray(item.genre_ids) ? item.genre_ids : [];
      title.genres = ids.map((id) => genreMap.get(id)).filter(Boolean) as GenreEntity[];

      await this.titles.save(title);
    }
  }

  private async markFeatured(tmdbIds: number[], type: TitleType) {
    // reset featured for that type
    await this.titles.update({ type }, { featured: false });
    // mark selected as featured
    for (const tmdbId of tmdbIds) {
      await this.titles.update({ tmdbId }, { featured: true });
    }
  }
}
