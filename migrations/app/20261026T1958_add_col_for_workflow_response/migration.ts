#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/255ca92e4ad446122e193adb84b17a00badb6c0d1ef526ab62475cd23fbdbbc4/contract';
import startContract from '../../snapshots/255ca92e4ad446122e193adb84b17a00badb6c0d1ef526ab62475cd23fbdbbc4/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/366a38765083f2a4c4e0b7a9ff07024681c9c08125486d923767317173eec5f8/contract';
import endContract from '../../snapshots/366a38765083f2a4c4e0b7a9ff07024681c9c08125486d923767317173eec5f8/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'WorkflowPipeline',
        column: col('whenResponse', 'bool', {
          notNull: true,
          default: lit(false),
          codecRef: { codecId: 'pg/bool@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
