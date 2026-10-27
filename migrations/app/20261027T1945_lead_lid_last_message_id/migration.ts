#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/89af9a46c2737e704e5f30e9809c5b60205dcae27b8096cb3a8e25eca5b4f49b/contract';
import endContract from '../../snapshots/89af9a46c2737e704e5f30e9809c5b60205dcae27b8096cb3a8e25eca5b4f49b/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/c87605ecbc5c5ca884603436f4dac778b0af197419c3064720c0c7e74393bb3b/contract';
import startContract from '../../snapshots/c87605ecbc5c5ca884603436f4dac778b0af197419c3064720c0c7e74393bb3b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Lead',
        column: col('lastMessageId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'Lead',
        column: col('lid', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
