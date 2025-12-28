// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepo.findOne({ where: { email: email.toLowerCase() } });
  }

  async createUser(params: {
    email: string;
    passwordHash: string;
    role?: 'user' | 'admin';
  }) {
    const user = this.usersRepo.create({
      email: params.email.toLowerCase(),
      passwordHash: params.passwordHash,
      role: params.role ?? 'user',
    });
    return this.usersRepo.save(user);
  }
}
