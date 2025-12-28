import { Test, TestingModule } from '@nestjs/testing';
import { PlaybackService } from './playback.service';

describe('PlaybackService', () => {
  let service: PlaybackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaybackService],
    }).compile();

    service = module.get<PlaybackService>(PlaybackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
