#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/3bff2f2df7518f0c604d49ad3325910fe9f7f1916fe31552005661ff06ffd2c3/contract';
import endContract from '../../snapshots/3bff2f2df7518f0c604d49ad3325910fe9f7f1916fe31552005661ff06ffd2c3/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/5d130a7928343ebc3266554f73e455c648419759b6fc3b028b8dab17577cfc2a/contract';
import startContract from '../../snapshots/5d130a7928343ebc3266554f73e455c648419759b6fc3b028b8dab17577cfc2a/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropCheckConstraint({
        schema: 'public',
        table: 'Diffusion',
        constraint: 'Diffusion_status_check_4be23e0f',
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'Diffusion',
        constraint: 'Diffusion_status_check_007991d5',
        expression: sql`"status" IN ('active', 'pending', 'cancelled', 'sending', 'completed', 'failed', 'stopped')`,
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
