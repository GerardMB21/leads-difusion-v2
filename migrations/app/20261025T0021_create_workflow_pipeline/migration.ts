#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/4d6eb1c38a50606c6683dbcd2cb5516d37cb911c3708c31ca4d67ab93cd5405a/contract';
import endContract from '../../snapshots/4d6eb1c38a50606c6683dbcd2cb5516d37cb911c3708c31ca4d67ab93cd5405a/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/ec873a2e6cb66320b5cc5e7e23e1f58c535c275d5f4e708fdf9f84d1e40964b9/contract';
import startContract from '../../snapshots/ec873a2e6cb66320b5cc5e7e23e1f58c535c275d5f4e708fdf9f84d1e40964b9/contract.json' with { type: 'json' };
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
        table: 'WorkflowPipeline',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('deletedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('fromPipelineId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('toPipelineId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('waitingTime', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('whenNotResponse', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('whenSendMessage', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'WorkflowPipeline',
        index: 'WorkflowPipeline_fromPipelineId_idx_a5fe301b',
        columns: ['fromPipelineId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'WorkflowPipeline',
        index: 'WorkflowPipeline_toPipelineId_idx_d5d3199d',
        columns: ['toPipelineId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'WorkflowPipeline',
        foreignKey: {
          name: 'WorkflowPipeline_fromPipelineId_fkey',
          columns: ['fromPipelineId'],
          references: { schema: 'public', table: 'Pipeline', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'WorkflowPipeline',
        foreignKey: {
          name: 'WorkflowPipeline_toPipelineId_fkey',
          columns: ['toPipelineId'],
          references: { schema: 'public', table: 'Pipeline', columns: ['id'] },
        },
      }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'WorkflowPipeline' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
