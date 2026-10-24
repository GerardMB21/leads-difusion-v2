#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/2f2ef3d07a8f1b628d5963b1dc6ed999c0f376a559e1702098b70aa4d3bded57/contract';
import startContract from '../../snapshots/2f2ef3d07a8f1b628d5963b1dc6ed999c0f376a559e1702098b70aa4d3bded57/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/69a278a77759168b4f7c9eb3f922795d51f0568590a45216f5901142a5f10b04/contract';
import endContract from '../../snapshots/69a278a77759168b4f7c9eb3f922795d51f0568590a45216f5901142a5f10b04/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
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
      this.createIndex({
        schema: 'public',
        table: 'Lead',
        index: 'Lead_beforePipelineId_idx_f16addde',
        columns: ['beforePipelineId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Lead',
        index: 'Lead_pipelineId_idx_671407ae',
        columns: ['pipelineId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Lead',
        index: 'Lead_templateId_idx_19e0d972',
        columns: ['templateId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Lead',
        foreignKey: {
          name: 'Lead_pipelineId_fkey',
          columns: ['pipelineId'],
          references: { schema: 'public', table: 'Pipeline', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Lead',
        foreignKey: {
          name: 'Lead_beforePipelineId_fkey',
          columns: ['beforePipelineId'],
          references: { schema: 'public', table: 'Pipeline', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Lead',
        foreignKey: {
          name: 'Lead_templateId_fkey',
          columns: ['templateId'],
          references: { schema: 'public', table: 'Template', columns: ['id'] },
        },
      }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'Lead' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
