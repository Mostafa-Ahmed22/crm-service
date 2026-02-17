import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  private readonly MAX_LIMIT = 100;
  private readonly DEFAULT_LIMIT = 10;
  private readonly DEFAULT_PAGE = 1;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Check if page and limit are provided
    if (!request.query.page && !request.query.limit) {
      request.pagination = {
      page: undefined,
      limit: undefined,
      skip: undefined
    }
    return next.handle();
    }
    // Parse and validate page
    let page = parseInt(request.query.page) || this.DEFAULT_PAGE;
    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }

    // Parse and validate limit
    let limit = parseInt(request.query.limit) || this.DEFAULT_LIMIT;
    if (limit < 1) {
      throw new BadRequestException('Limit must be greater than 0');
    }
    if (limit > this.MAX_LIMIT) {
      limit = this.MAX_LIMIT;
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Attach pagination to request
    request.pagination = {
      page,
      limit,
      skip
    };

    return next.handle();
  }
}