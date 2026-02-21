import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { MailModule } from './mail/mail.module';
import { HelperModule } from './helper/helper.module';
import { CustomersModule } from './customers/customers.module';
import { RolesModule } from './roles/roles.module';
import { DefinitionsModule } from './definitions/definitions.module';
import configuration from './config/configuration';
import { ProjectsModule } from './units/projects.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    MailModule,
    HelperModule,
    AuthModule,
    EmployeesModule,
    CustomersModule,
    RolesModule,
    DefinitionsModule,
    ProjectsModule
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  controllers: [],
})
export class AppModule {}
