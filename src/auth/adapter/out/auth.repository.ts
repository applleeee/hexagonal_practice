import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'entity/User';
import { IAuthRepository } from 'src/auth/domain/outboundPort/IAuth.repository';
import { Repository } from 'typeorm';
import { SignUpData } from '../auth.dto';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(signUpData: SignUpData) {
    const user = this.userRepository.create(signUpData);

    try {
      return await this.userRepository.save(user);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new HttpException(
          'USERNAME or EAMIL DUPLICATED',
          HttpStatus.CONFLICT,
        );
      }
    }
  }
}
