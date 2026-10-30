#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/de924d92d714be4aec4b55ad6ade005eb88c7e68a19dec3848bbad7c32fa90e0/contract';
import endContract from '../../snapshots/de924d92d714be4aec4b55ad6ade005eb88c7e68a19dec3848bbad7c32fa90e0/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/f848aedb35434c4b50e7f95a9d87a1fbb6cc06dce336825aa475905ac645c3c3/contract';
import startContract from '../../snapshots/f848aedb35434c4b50e7f95a9d87a1fbb6cc06dce336825aa475905ac645c3c3/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Diffusion',
        column: col('beforeSendAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
