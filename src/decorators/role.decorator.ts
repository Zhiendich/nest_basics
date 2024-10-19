import { SetMetadata } from '@nestjs/common';
import { Roles as RolesEmum } from '@prisma/client';

export const CheckRoles = (...roles: RolesEmum[]) =>
  SetMetadata('roles', roles);
