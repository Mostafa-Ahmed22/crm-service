import { Module } from '@nestjs/common';
import { RolesController } from './roles/roles.controller';
import { ModulesController } from './definitions/definitions.controller';
import { DefinitionsService } from './definitions/definitions.service';
import { RolesService } from './roles/roles.service';

@Module({
  controllers: [RolesController, ModulesController],
  providers: [DefinitionsService, RolesService]
})
export class AccessControlModule { }
