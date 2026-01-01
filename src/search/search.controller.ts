import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) { }

  @Get('suggest')
  suggest(
    @Query('q') q = '',
    @Query('scope') scope: 'all' | 'title' | 'people' | 'genre' = 'all',
  ) {
    return this.search.suggest({ q, scope });
  }
}
