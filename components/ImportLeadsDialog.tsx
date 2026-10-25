'use client';

import type { ImportLeadsResult } from '@/app/leads/types';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconUpload } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import ImportLeadsForm from './ImportLeadsForm';

const ImportLeadsDialog = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ImportLeadsResult | null>(null);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button variant="outline" className="flex items-center justify-center gap-1">
              <IconUpload size={16} />
              Importar leads
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar leads</DialogTitle>
            <DialogDescription>
              Sube un archivo .xlsx o .csv con las columnas &quot;Contacto principal&quot;,
              &quot;Teléfono celular (contacto)&quot; y &quot;Captación (contacto)&quot;.
            </DialogDescription>
          </DialogHeader>
          <ImportLeadsForm
            onSuccess={(data) => {
              setOpen(false);
              setResult(data);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={!!result} onOpenChange={(next) => !next && setResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importación finalizada</DialogTitle>
            <DialogDescription>
              {result?.created} creados, {result?.skipped.length} omitidos.
            </DialogDescription>
          </DialogHeader>
          {!!result?.skipped.length && (
            <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto text-sm">
              {result.skipped.map(({ row, reason }) => (
                <li key={`${row}-${reason}`}>
                  <span className="font-medium">Fila {row}:</span> {reason}
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImportLeadsDialog;
