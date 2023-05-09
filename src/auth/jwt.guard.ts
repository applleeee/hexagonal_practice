import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user) {
    if (err || !user) {
      return false;
    }
    return user;
  }
}
