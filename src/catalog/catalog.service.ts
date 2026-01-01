import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { TitleEntity, TitleType } from './entities/title.entity';
import { GenreEntity } from './entities/genre.entity';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(TitleEntity)
    private readonly titlesRepo: Repository<TitleEntity>,
    @InjectRepository(GenreEntity)
    private readonly genresRepo: Repository<GenreEntity>,
  ) { }

  async list(params: {
    page: number;
    pageSize: number;
    search?: string;
    featured?: boolean;
  }) {
    const { page, pageSize, search, featured } = params;

    const where: any = {};
    if (typeof featured === 'boolean') where.featured = featured;
    if (search && search.trim().length > 0) where.name = ILike(`%${search.trim()}%`);

    const [items, total] = await this.titlesRepo.findAndCount({
      where,
      relations: { genres: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { page, pageSize, total, items };
  }

  async search(params: {
    page: number;
    pageSize: number;
    q?: string;
    type?: TitleType;
    genreId?: string;
    featured?: boolean; // ✅ agregar
  }) {
    const { page, pageSize, q, type, genreId, featured } = params;

    const qb = this.titlesRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.genres', 'g');

    if (typeof featured === 'boolean') {
      qb.andWhere('t.featured = :featured', { featured });
    }

    if (q && q.trim().length > 0) {
      qb.andWhere('LOWER(t.name) LIKE :q', { q: `%${q.trim().toLowerCase()}%` });
    }

    if (type) qb.andWhere('t.type = :type', { type });

    if (genreId && genreId.trim().length > 0) {
      qb.andWhere('g.id = :genreId', { genreId: genreId.trim() });
    }

    qb.orderBy('t.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return { page, pageSize, total, items };
  }



  async listGenres() {
    return this.genresRepo.find({ order: { name: 'ASC' } });
  }

  async getById(id: string) {
    const title = await this.titlesRepo.findOne({
      where: { id },
      relations: { genres: true },
    });
    if (!title) throw new NotFoundException('Title not found');
    return title;
  }
}
