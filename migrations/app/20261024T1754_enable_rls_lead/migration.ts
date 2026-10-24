#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/cd944711f74652bbb7cb5a7b98b44cc1adeb6488e3c599349a4a47c13007c996/contract';
import endContract from '../../snapshots/cd944711f74652bbb7cb5a7b98b44cc1adeb6488e3c599349a4a47c13007c996/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/fceae792e24aad16a8ee3481a7d83bd465058122f03fef0cafb47c3e1a24a09a/contract';
import startContract from '../../snapshots/fceae792e24aad16a8ee3481a7d83bd465058122f03fef0cafb47c3e1a24a09a/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [this.enableRowLevelSecurity({ schema: 'public', table: 'Lead' })];
  }
}

MigrationCLI.run(import.meta.url, M);
