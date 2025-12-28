import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlaybackService } from './playback.service';

@Controller('playback')
export class PlaybackController {
  constructor(private readonly playback: PlaybackService) { }

  @UseGuards(JwtAuthGuard)
  @Get(':titleId')
  getPlayback(@Param('titleId') titleId: string) {
    return this.playback.getPlaybackUrl(titleId);
  }
}
