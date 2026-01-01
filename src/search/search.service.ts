import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { TitleEntity } from '../catalog/entities/title.entity';
import { GenreEntity } from '../catalog/entities/genre.entity';

type Scope = 'all' | 'title' | 'people' | 'genre';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(TitleEntity) private readonly titles: Repository<TitleEntity>,
    @InjectRepository(GenreEntity) private readonly genres: Repository<GenreEntity>,
  ) { }

  async suggest({ q, scope }: { q: string; scope: Scope }) {
    const query = (q ?? '').trim();
    if (query.length < 2) {
      return { q: query, scope, items: [] };
    }

    const items: any[] = [];

    if (scope === 'all' || scope === 'title') {
      const titles = await this.titles.find({
        where: { name: ILike(`%${query}%`) },
        take: 8,
        order: { createdAt: 'DESC' },
      });

      items.push(
        ...titles.map((t) => ({
          kind: 'title' as const,
          id: t.id,
          name: t.name,
          type: t.type,
          year: t.year,
          posterUrl: t.posterUrl,
        })),
      );
    }

    if (scope === 'all' || scope === 'genre') {
      const genres = await this.genres.find({
        where: { name: ILike(`%${query}%`) },
        take: 6,
        order: { name: 'ASC' },
      });

      items.push(
        ...genres.map((g) => ({
          kind: 'genre' as const,
          name: g.name,
        })),
      );
    }

    // People: lo agregamos después (TMDb /search/person)
    return { q: query, scope, items };
  }
}
