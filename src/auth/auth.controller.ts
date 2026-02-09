import { Controller, Post, Body, Req, Get, Query, Param } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public } from "../decorators/public.decorator";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @Post("login")
  async login(@Req() req, @Body() body: { email: string; password: string }) {
    const user = await this.authService.validateEmployee(body.email, body.password);
    if (!user) {
      return { error: "Invalid credentials" };
    }
    return this.authService.login(user, req.lang);
  } 
}