// src/catalog/catalog.controller.ts
import {
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) { }

  // GET /catalog?page=1&pageSize=20&search=star&featured=true
  @Get('catalog')
  list(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 20,
    @Query('search') search?: string,
    @Query('featured', new ParseBoolPipe({ optional: true }))
    featured?: boolean,
  ) {
    // guardrails
    const safePage = Math.max(1, page);
    const safePageSize = Math.min(50, Math.max(1, pageSize));
    return this.catalog.list({
      page: safePage,
      pageSize: safePageSize,
      search,
      featured,
    });
  }

  // GET /titles/:id
  @Get('titles/:id')
  getById(@Param('id') id: string) {
    return this.catalog.getById(id);
  }
}
