#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/69a278a77759168b4f7c9eb3f922795d51f0568590a45216f5901142a5f10b04/contract';
import startContract from '../../snapshots/69a278a77759168b4f7c9eb3f922795d51f0568590a45216f5901142a5f10b04/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/ec873a2e6cb66320b5cc5e7e23e1f58c535c275d5f4e708fdf9f84d1e40964b9/contract';
import endContract from '../../snapshots/ec873a2e6cb66320b5cc5e7e23e1f58c535c275d5f4e708fdf9f84d1e40964b9/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'TagInLead',
        columns: [
          col('leadId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('tagId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['tagId', 'leadId'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'TagInLead',
        index: 'TagInLead_leadId_idx_9113844c',
        columns: ['leadId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'TagInLead',
        index: 'TagInLead_tagId_idx_86854244',
        columns: ['tagId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'TagInLead',
        foreignKey: {
          name: 'TagInLead_tagId_fkey',
          columns: ['tagId'],
          references: { schema: 'public', table: 'Tag', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'TagInLead',
        foreignKey: {
          name: 'TagInLead_leadId_fkey',
          columns: ['leadId'],
          references: { schema: 'public', table: 'Lead', columns: ['id'] },
        },
      }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'TagInLead' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
