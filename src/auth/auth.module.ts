import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { RolesGuard } from "./guards/roles.guard";
import { PasswordService } from "./password.service";
import * as fs from "fs";
import { SeedService } from "src/auth/seeds/seeds.service";

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async () => ({
        privateKey: fs.readFileSync("keys/private.pem"),
        publicKey: fs.readFileSync("keys/public.pem"),
        signOptions: { algorithm: "RS256", expiresIn: "24h" },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, RolesGuard, PasswordService, SeedService,
  ],
  controllers: [AuthController],
  exports: [PasswordService]
})
export class AuthModule { }