#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/5d130a7928343ebc3266554f73e455c648419759b6fc3b028b8dab17577cfc2a/contract';
import endContract from '../../snapshots/5d130a7928343ebc3266554f73e455c648419759b6fc3b028b8dab17577cfc2a/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/75ff83515364fc6afc6d9dec788924d940dfce0f49ffe1b24e666bf7a1100b95/contract';
import startContract from '../../snapshots/75ff83515364fc6afc6d9dec788924d940dfce0f49ffe1b24e666bf7a1100b95/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Lead',
        column: col('hasWhatsapp', 'bool', {
          notNull: true,
          default: lit(true),
          codecRef: { codecId: 'pg/bool@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
