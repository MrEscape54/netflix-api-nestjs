/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/catalog/catalog.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { TitleEntity } from './entities/title.entity';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(TitleEntity)
    private readonly titlesRepo: Repository<TitleEntity>,
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
    if (search && search.trim().length > 0)
      where.name = ILike(`%${search.trim()}%`);

    const [items, total] = await this.titlesRepo.findAndCount({
      where,
      relations: { genres: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      page,
      pageSize,
      total,
      items,
    };
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
