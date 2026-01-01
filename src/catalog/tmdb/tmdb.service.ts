import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TmdbService {
  private apiKey: string;
  private baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('TMDB_API_KEY')!;
    this.baseUrl = this.config.get<string>('TMDB_BASE_URL')!;
  }

  private async get(path: string) {
    const url = `${this.baseUrl}${path}${path.includes('?') ? '&' : '?'}api_key=${this.apiKey}&language=en-US`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`TMDb error ${res.status}`);
    return res.json();
  }

  async getImageConfig() {
    return this.get('/configuration');
  }

  async getPopularMovies(page = 1) {
    return this.get(`/movie/popular?page=${page}`);
  }

  async getPopularSeries(page = 1) {
    return this.get(`/tv/popular?page=${page}`);
  }

  async getMovieGenres() {
    return this.get('/genre/movie/list');
  }

  async getTvGenres() {
    return this.get('/genre/tv/list');
  }
}
