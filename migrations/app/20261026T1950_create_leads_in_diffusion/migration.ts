#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/0c858dcc937c38cf1762ca77b000f1de6bf876c0e2f3cd70d9780dfab6052bc3/contract';
import startContract from '../../snapshots/0c858dcc937c38cf1762ca77b000f1de6bf876c0e2f3cd70d9780dfab6052bc3/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/255ca92e4ad446122e193adb84b17a00badb6c0d1ef526ab62475cd23fbdbbc4/contract';
import endContract from '../../snapshots/255ca92e4ad446122e193adb84b17a00badb6c0d1ef526ab62475cd23fbdbbc4/contract.json' with { type: 'json' };
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
        table: 'LeadInDiffusion',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('deletedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('diffusionId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('error', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('leadId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('sentAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('pending'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('templateId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('waited', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'LeadInDiffusion_status_check_57dbf97e',
            sql`"status" IN ('pending', 'sending', 'sent', 'failed')`,
          ),
        ],
      }),
      this.createIndex({
        schema: 'public',
        table: 'LeadInDiffusion',
        index: 'LeadInDiffusion_diffusionId_idx_67f61184',
        columns: ['diffusionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'LeadInDiffusion',
        index: 'LeadInDiffusion_leadId_idx_9113844c',
        columns: ['leadId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'LeadInDiffusion',
        index: 'LeadInDiffusion_templateId_idx_19e0d972',
        columns: ['templateId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'LeadInDiffusion',
        foreignKey: {
          name: 'LeadInDiffusion_diffusionId_fkey',
          columns: ['diffusionId'],
          references: { schema: 'public', table: 'Diffusion', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'LeadInDiffusion',
        foreignKey: {
          name: 'LeadInDiffusion_leadId_fkey',
          columns: ['leadId'],
          references: { schema: 'public', table: 'Lead', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'LeadInDiffusion',
        foreignKey: {
          name: 'LeadInDiffusion_templateId_fkey',
          columns: ['templateId'],
          references: { schema: 'public', table: 'Template', columns: ['id'] },
        },
      }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'LeadInDiffusion' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
