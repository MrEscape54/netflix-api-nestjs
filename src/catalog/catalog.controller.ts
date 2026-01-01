import { Controller, Get, Param, ParseBoolPipe, ParseIntPipe, ParseUUIDPipe, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import type { TitleType } from './entities/title.entity';

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) { }

  @Get('catalog')
  list(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 20,
    @Query('search') search?: string,
    @Query('featured', new ParseBoolPipe({ optional: true })) featured?: boolean,
  ) {
    const safePage = Math.max(1, page);
    const safePageSize = Math.min(50, Math.max(1, pageSize));
    return this.catalog.list({ page: safePage, pageSize: safePageSize, search, featured });
  }

  @Get('catalog/search')
  search(
    @Query('q') q?: string,
    @Query('type') type?: TitleType,
    @Query('genreId') genreId?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 20,
    @Query('featured', new ParseBoolPipe({ optional: true })) featured?: boolean,
  ) {
    const safePage = Math.max(1, page);
    const safePageSize = Math.min(50, Math.max(1, pageSize));
    return this.catalog.search({ q, type, genreId, page: safePage, pageSize: safePageSize, featured });
  }

  @Get('genres')
  listGenres() {
    return this.catalog.listGenres();
  }

  @Get('titles/:id')
  getTitleById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.catalog.getById(id);
  }
}
