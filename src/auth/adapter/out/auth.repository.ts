import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'entity/User';
import { IAuthRepository } from 'src/auth/domain/outboundPort/IAuth.repository';
import { Repository } from 'typeorm';
import { SignInData, SignUpData } from '../auth.dto';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(signUpData: SignUpData): Promise<User> {
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

  async getUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ email });
      if (!user) {
        throw new HttpException(
          'NO USER WITH THIS EMAIL',
          HttpStatus.NOT_FOUND,
        );
      }
      return user;
    } catch (err) {
      throw new HttpException(
        'FAILED TO FIND USER',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
