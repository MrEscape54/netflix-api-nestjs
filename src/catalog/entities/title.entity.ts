/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GenreEntity } from './genre.entity';

export type TitleType = 'movie' | 'series';

@Entity('titles')
export class TitleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  type: TitleType;

  @Column({ type: 'int', nullable: true })
  year: number | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ageRating: string | null;

  // For MVP we store URLs directly
  @Column({ type: 'varchar', length: 500, nullable: true })
  posterUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  backdropUrl: string | null;

  // Later we’ll use Playback assets, but MVP can store HLS URL here too
  @Column({ type: 'varchar', length: 700, nullable: true })
  playbackHlsUrl: string | null;

  @Column({ type: 'boolean', default: false })
  featured: boolean;

  @ManyToMany(() => GenreEntity, (genre) => genre.titles, { cascade: true })
  @JoinTable({
    name: 'title_genres',
    joinColumn: { name: 'title_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'genre_id', referencedColumnName: 'id' },
  })
  genres: GenreEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
