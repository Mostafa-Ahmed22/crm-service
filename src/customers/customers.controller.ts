import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { CustomersService } from './customers.service';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { CurrentPagination } from 'src/common/decorators/pagination.decorator';
import * as dtos from './dtos/index.dto';
import type * as interfaces from 'src/common/interfaces/index.interfaces';
import { CurrentLanguage } from 'src/common/decorators/language.decorator';
@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) { }

  @Post()
  createCustomer(@CurrentUser() user: interfaces.User, @Body() createCustomerDto: dtos.CreateCustomerDto) {
    return this.customersService.createCustomer(user, createCustomerDto);
  }

  @Get()
  getCustomers(@CurrentUser() user: interfaces.User, @CurrentLanguage() lang: string, @CurrentPagination() pagination: interfaces.Pagination, @Query() query: dtos.GetCustomersDto) {
    return this.customersService.getCustomers(user, lang, pagination, query);
  }

  @Post('assign-unit-to-customer')
  assignUnitToCustomer(@CurrentUser() user: interfaces.User, @Body() body: dtos.AssignUnitToCustomerDto) {
    return this.customersService.assignUnitToCustomer(user, body);
  }

  @Public()
  @Get('/mobile/:mobile_number')
  getCustomerByMobile(@CurrentLanguage() lang: string, @Param('mobile_number') mobileNumber: string) {
    return this.customersService.getCustomerByMobile(lang, mobileNumber);
  }

}
