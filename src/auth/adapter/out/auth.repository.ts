import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'entity/User';
import { IAuthRepository } from 'src/auth/domain/outboundPort/IAuth.repository';
import { Repository } from 'typeorm';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  test() {}
}
