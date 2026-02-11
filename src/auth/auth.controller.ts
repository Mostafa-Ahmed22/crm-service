import { Controller, Post, Body, Req, Get, Query, Param, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public } from "../decorators/public.decorator";
import { LoginDto } from "./dtos/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @Post("login")
  async login(@Req() req, @Body() loginDto: LoginDto) {    
    const user = await this.authService.validateEmployee(loginDto);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user, req.lang);
  } 
}