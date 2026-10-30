#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/8f557b5a2a497169535c530772a7ce63b2625044dfec024d255d91e0023a19f1/contract';
import startContract from '../../snapshots/8f557b5a2a497169535c530772a7ce63b2625044dfec024d255d91e0023a19f1/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/f848aedb35434c4b50e7f95a9d87a1fbb6cc06dce336825aa475905ac645c3c3/contract';
import endContract from '../../snapshots/f848aedb35434c4b50e7f95a9d87a1fbb6cc06dce336825aa475905ac645c3c3/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Diffusion',
        column: col('errorServer', 'int4', {
          notNull: true,
          default: lit(0),
          codecRef: { codecId: 'pg/int4@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'Diffusion',
        column: col('restartAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'Diffusion',
        column: col('stoppedAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
