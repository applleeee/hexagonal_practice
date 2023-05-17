import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import {
  ClassSerializerInterceptor,
  HttpException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validationError: { target: true, value: true },
      exceptionFactory: (validationErrors: ValidationError[]) => {
        return new HttpException(
          `${validationErrors}}`,
          HttpStatus.BAD_REQUEST,
        );
      },
    }),
  );
  app.use(morgan('dev'));
  app.enableCors();

  const port = process.env.PORT;
  await app.listen(port);
  console.log(`server is listening on port ${port}`);
}
bootstrap();
