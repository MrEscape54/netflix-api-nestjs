/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Column,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TitleEntity } from './title.entity';

@Entity('genres')
export class GenreEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 60 })
  name: string;

  @ManyToMany(() => TitleEntity, (title) => title.genres)
  titles: TitleEntity[];
}
