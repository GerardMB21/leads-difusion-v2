#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/75ff83515364fc6afc6d9dec788924d940dfce0f49ffe1b24e666bf7a1100b95/contract';
import endContract from '../../snapshots/75ff83515364fc6afc6d9dec788924d940dfce0f49ffe1b24e666bf7a1100b95/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/89af9a46c2737e704e5f30e9809c5b60205dcae27b8096cb3a8e25eca5b4f49b/contract';
import startContract from '../../snapshots/89af9a46c2737e704e5f30e9809c5b60205dcae27b8096cb3a8e25eca5b4f49b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createIndex({
        schema: 'public',
        table: 'Lead',
        index: 'Lead_lastMessageId_idx_84e5ba47',
        columns: ['lastMessageId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Lead',
        index: 'Lead_lid_idx_f5efcb21',
        columns: ['lid'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Lead',
        index: 'Lead_phone_idx_8db23f45',
        columns: ['phone'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Lead',
        index: 'Lead_pipelineId_deletedAt_idx_45c3bf9b',
        columns: ['pipelineId', 'deletedAt'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
