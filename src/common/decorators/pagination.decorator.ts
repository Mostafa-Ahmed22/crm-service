
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Pagination } from '../interfaces/pagination.interface';

export const CurrentPagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) : Pagination => {
    const request = ctx.switchToHttp().getRequest();
    return request.pagination;
  },
);