import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import * as dtos from './dtos/index.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { CustomersService } from './customers.service';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import type * as interfaces from 'src/common/interfaces/index.interfaces';
@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) { }

  @Post()
  createCustomer(@CurrentUser() user: interfaces.User, @Body() createCustomerDto: dtos.CreateCustomerDto) {
    return this.customersService.createCustomer(user, createCustomerDto);
  }

}
