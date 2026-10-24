#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/fceae792e24aad16a8ee3481a7d83bd465058122f03fef0cafb47c3e1a24a09a/contract';
import endContract from '../../snapshots/fceae792e24aad16a8ee3481a7d83bd465058122f03fef0cafb47c3e1a24a09a/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Lead',
        columns: [
          col('beforePipelineId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('contactName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('deletedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('enrollmentDate', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('lastContact', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('messageResponse', 'bool', {
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('order', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('phone', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('pipelineId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('templateId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
