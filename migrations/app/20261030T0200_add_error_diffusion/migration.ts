#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/3bff2f2df7518f0c604d49ad3325910fe9f7f1916fe31552005661ff06ffd2c3/contract';
import startContract from '../../snapshots/3bff2f2df7518f0c604d49ad3325910fe9f7f1916fe31552005661ff06ffd2c3/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/8f557b5a2a497169535c530772a7ce63b2625044dfec024d255d91e0023a19f1/contract';
import endContract from '../../snapshots/8f557b5a2a497169535c530772a7ce63b2625044dfec024d255d91e0023a19f1/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Diffusion',
        column: col('error', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
