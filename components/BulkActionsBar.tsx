'use client';

import { useState } from 'react';
import { IconTrash } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  count: number;
  noun: [singular: string, plural: string];
  onDelete: () => Promise<void>;
}

const BulkActionsBar = ({ count, noun, onDelete }: Props) => {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (count === 0) return null;

  const name = count === 1 ? noun[0] : noun[1];

  const confirm = async () => {
    setDeleting(true);
    setError(null);

    try {
      await onDelete();

      setOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : `No se pudieron eliminar los ${noun[1]}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-3 py-2 text-sm">
        <span>
          {count} {name} seleccionado{count === 1 ? '' : 's'}
        </span>
        <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
          <IconTrash />
          Eliminar
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Eliminar {count} {name}
            </DialogTitle>
            <DialogDescription>
              ¿Seguro que quieres eliminar los {count} {name} seleccionados? Esta acción los quita
              del sistema.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirm} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BulkActionsBar;
