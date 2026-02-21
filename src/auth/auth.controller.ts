import { Controller, Post, Body, Req, Get, Query, Param, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public } from "../common/decorators/public.decorator";
import * as dtos from "./dtos/index.dtos";
import { CurrentUser } from "src/common/decorators/user.decorator";
import type * as interfaces from 'src/common/interfaces/index.interfaces';

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @Post("login")
  async login(@Req() req, @Body() loginDto: dtos.LoginDto) {
    const user = await this.authService.validateEmployee(loginDto);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user, req.lang);
  }

  @Post("reset-password")
  async resetPassword(@Body() body: dtos.ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  @Post("change-password")
  async changePassword(@CurrentUser() user: interfaces.User , @Body() body: dtos.ChangePasswordDto) {
    return this.authService.changePassword(user, body);
  }

}