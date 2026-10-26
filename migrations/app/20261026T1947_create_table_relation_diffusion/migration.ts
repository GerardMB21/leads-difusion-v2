#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/0c858dcc937c38cf1762ca77b000f1de6bf876c0e2f3cd70d9780dfab6052bc3/contract';
import endContract from '../../snapshots/0c858dcc937c38cf1762ca77b000f1de6bf876c0e2f3cd70d9780dfab6052bc3/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/d84bf04e7c53c3c2d48a1210d6e06a1c1c5b8057a62d9b30ea5cd3f811937f6a/contract';
import startContract from '../../snapshots/d84bf04e7c53c3c2d48a1210d6e06a1c1c5b8057a62d9b30ea5cd3f811937f6a/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'TagInDiffusion',
        columns: [
          col('diffusionId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('tagId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['tagId', 'diffusionId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'TemplateInDiffusion',
        columns: [
          col('diffusionId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('templateId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['templateId', 'diffusionId'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'TagInDiffusion',
        index: 'TagInDiffusion_diffusionId_idx_67f61184',
        columns: ['diffusionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'TagInDiffusion',
        index: 'TagInDiffusion_tagId_idx_86854244',
        columns: ['tagId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'TemplateInDiffusion',
        index: 'TemplateInDiffusion_diffusionId_idx_67f61184',
        columns: ['diffusionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'TemplateInDiffusion',
        index: 'TemplateInDiffusion_templateId_idx_19e0d972',
        columns: ['templateId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'TagInDiffusion',
        foreignKey: {
          name: 'TagInDiffusion_tagId_fkey',
          columns: ['tagId'],
          references: { schema: 'public', table: 'Tag', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'TagInDiffusion',
        foreignKey: {
          name: 'TagInDiffusion_diffusionId_fkey',
          columns: ['diffusionId'],
          references: { schema: 'public', table: 'Diffusion', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'TemplateInDiffusion',
        foreignKey: {
          name: 'TemplateInDiffusion_templateId_fkey',
          columns: ['templateId'],
          references: { schema: 'public', table: 'Template', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'TemplateInDiffusion',
        foreignKey: {
          name: 'TemplateInDiffusion_diffusionId_fkey',
          columns: ['diffusionId'],
          references: { schema: 'public', table: 'Diffusion', columns: ['id'] },
        },
      }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'TagInDiffusion' }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'TemplateInDiffusion' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
