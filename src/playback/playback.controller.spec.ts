import { Test, TestingModule } from '@nestjs/testing';
import { PlaybackController } from './playback.controller';

describe('PlaybackController', () => {
  let controller: PlaybackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaybackController],
    }).compile();

    controller = module.get<PlaybackController>(PlaybackController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
