import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseFormatInterceptor } from './common/interceptors/custom.interceptor';
import { ResponseFormatExceptionFilter } from './common/filters/custom.filter';
import { LanguageInterceptor } from './common/interceptors/language.Interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, 
    }),
  );
  app.useGlobalInterceptors(new LanguageInterceptor(), new ResponseFormatInterceptor());
  app.useGlobalFilters(new ResponseFormatExceptionFilter());

  await app.listen(process.env.PORT ?? 3005);
}
bootstrap();
