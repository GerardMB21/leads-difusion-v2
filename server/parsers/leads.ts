import { read, utils } from 'xlsx';

import type { ImportIssue, ImportLeadRow } from '@/app/leads/types';

import { importLeadRowSchema } from '@/app/leads/schemas';

const COLUMNS = {
  contactName: 'Contacto principal',
  phone: 'Teléfono celular (contacto)',
  enrollmentDate: 'Captación (contacto)',
} as const;

const ZIP_MAGIC = '80,75';
const EXCEL_EPOCH = Date.UTC(1899, 11, 30);
const DAY_MS = 86_400_000;
const DMY = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;

export const NO_VALID_ROWS = 'El archivo no contiene registros válidos';
export const MISSING_COLUMNS = 'Faltan columnas en el archivo';

function toIso(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === '') return undefined;

  let date: Date;

  if (value instanceof Date) date = value;
  else if (typeof value === 'number') date = new Date(EXCEL_EPOCH + value * DAY_MS);
  else {
    const text = String(value).trim();
    const dmy = DMY.exec(text);

    date = dmy
      ? new Date(+dmy[3], +dmy[2] - 1, +dmy[1], +(dmy[4] ?? 0), +(dmy[5] ?? 0), +(dmy[6] ?? 0))
      : new Date(text);
  }

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function parseLeadsFile(buffer: ArrayBuffer) {
  const isXlsx = new Uint8Array(buffer, 0, 2).join() === ZIP_MAGIC;
  const workbook = isXlsx
    ? read(buffer, { type: 'array', cellDates: true })
    : read(new TextDecoder('utf-8').decode(buffer).replace(/^\uFEFF/, ''), {
        type: 'string',
        cellDates: true,
      });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  if (!sheet) throw new Error(NO_VALID_ROWS);

  const records = utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  const headers = new Set(Object.keys(records[0] ?? {}));
  const missing = [COLUMNS.contactName, COLUMNS.phone].filter((name) => !headers.has(name));

  if (missing.length) throw new Error(`${MISSING_COLUMNS}: ${missing.join(', ')}`);

  const rows: ImportLeadRow[] = [];
  const errors: ImportIssue[] = [];

  records.forEach((record, index) => {
    const row = index + 2;
    const enrollmentDate = toIso(record[COLUMNS.enrollmentDate]);

    if (enrollmentDate === null) {
      errors.push({ row, reason: 'Fecha de captación inválida' });

      return;
    }

    const phones = String(record[COLUMNS.phone] ?? '')
      .split(/[,;/\n]+/)
      .map((phone) => phone.trim())
      .filter(Boolean);

    for (const phone of phones.length ? phones : ['']) {
      const parsed = importLeadRowSchema.safeParse({
        row,
        contactName: String(record[COLUMNS.contactName] ?? ''),
        phone,
        enrollmentDate,
      });

      if (parsed.success) rows.push(parsed.data);
      else
        errors.push({ row, reason: parsed.error.issues.map(({ message }) => message).join(', ') });
    }
  });

  return { rows, errors };
}
