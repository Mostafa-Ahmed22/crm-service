import { Module } from '@nestjs/common';
import { RolesController } from './roles/roles.controller';
import { ModulesController } from './modules/modules.controller';
import { ModulesService } from './modules/modules.service';
import { RolesService } from './roles/roles.service';

@Module({
  controllers: [ RolesController, ModulesController],
  providers: [ ModulesService, RolesService]
})
export class AccessControlModule {}
