import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { languageEnums } from '../enums/shared.enum';

@Injectable()
export class LanguageInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Check in multiple places: header, query, body
    let lang =
      request.headers['lang'] ||
      request.query.lang ||
      request.body?.lang;
      
      // Fallback to default if none provided
     if (lang && (lang.toLowerCase() !== languageEnums.ENGLISH && lang.toLowerCase() !== languageEnums.ARABIC))
        throw new BadRequestException('Invalid language. Supported values are "en" and "ar".');
      
     if (!lang) lang = languageEnums.ENGLISH;
      
      // Attach normalized language back to request
      request.lang = lang;

    return next.handle();
  }
}