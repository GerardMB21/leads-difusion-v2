#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/2f2ef3d07a8f1b628d5963b1dc6ed999c0f376a559e1702098b70aa4d3bded57/contract';
import endContract from '../../snapshots/2f2ef3d07a8f1b628d5963b1dc6ed999c0f376a559e1702098b70aa4d3bded57/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/8af4d767d224e8f67a4e2824996bb800cecae4debc77a5d0a4fb18f6b913f1b5/contract';
import startContract from '../../snapshots/8af4d767d224e8f67a4e2824996bb800cecae4debc77a5d0a4fb18f6b913f1b5/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [this.enableRowLevelSecurity({ schema: 'public', table: 'Tag' })];
  }
}

MigrationCLI.run(import.meta.url, M);
