#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/366a38765083f2a4c4e0b7a9ff07024681c9c08125486d923767317173eec5f8/contract';
import startContract from '../../snapshots/366a38765083f2a4c4e0b7a9ff07024681c9c08125486d923767317173eec5f8/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/c87605ecbc5c5ca884603436f4dac778b0af197419c3064720c0c7e74393bb3b/contract';
import endContract from '../../snapshots/c87605ecbc5c5ca884603436f4dac778b0af197419c3064720c0c7e74393bb3b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Lead',
        column: col('lastResponseAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'Lead',
        column: col('movedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'Lead',
        column: 'lastContact',
        type: 'timestamptz',
        // The old integer values are discarded on purpose (no lead had one), so the new column starts empty.
        using: sql`NULL::timestamptz`,
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
