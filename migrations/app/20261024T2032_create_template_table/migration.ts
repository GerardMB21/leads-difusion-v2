#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/20506b305eba57db7534688cf9a634ee9a967bd7622c6daa6a3b070b8ad6db0d/contract';
import startContract from '../../snapshots/20506b305eba57db7534688cf9a634ee9a967bd7622c6daa6a3b070b8ad6db0d/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/98c8da88b4c351ec7b135a1edf7959f163bc705e4a4eb00bb8d5bd5bd3e70fc6/contract';
import endContract from '../../snapshots/98c8da88b4c351ec7b135a1edf7959f163bc705e4a4eb00bb8d5bd5bd3e70fc6/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'Template',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('deletedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('img', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('message', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Template',
        constraint: 'Template_name_key',
        columns: ['name'],
      }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'Template' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
