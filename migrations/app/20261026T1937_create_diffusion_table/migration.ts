#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/4d6eb1c38a50606c6683dbcd2cb5516d37cb911c3708c31ca4d67ab93cd5405a/contract';
import startContract from '../../snapshots/4d6eb1c38a50606c6683dbcd2cb5516d37cb911c3708c31ca4d67ab93cd5405a/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/d84bf04e7c53c3c2d48a1210d6e06a1c1c5b8057a62d9b30ea5cd3f811937f6a/contract';
import endContract from '../../snapshots/d84bf04e7c53c3c2d48a1210d6e06a1c1c5b8057a62d9b30ea5cd3f811937f6a/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'Diffusion',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('deletedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('failed', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('finishedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('nextSendAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('pipelineId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('processed', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('sent', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('startAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('pending'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('total', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Diffusion_status_check_4be23e0f',
            sql`"status" IN ('active', 'pending', 'cancelled', 'sending', 'completed', 'failed')`,
          ),
        ],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Diffusion',
        index: 'Diffusion_pipelineId_idx_671407ae',
        columns: ['pipelineId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Diffusion',
        foreignKey: {
          name: 'Diffusion_pipelineId_fkey',
          columns: ['pipelineId'],
          references: { schema: 'public', table: 'Pipeline', columns: ['id'] },
        },
      }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'Diffusion' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
