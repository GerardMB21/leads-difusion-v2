'use client';

import type { DiffusionRow } from '../types';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api, getApiErrorMessage } from '@/lib/api';

const CancelDiffusionButton = ({ diffusion }: { diffusion: DiffusionRow }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCancel = async () => {
    setCancelling(true);
    setError(null);

    try {
      await api.patch(`/diffusions/${diffusion.id}`, { status: 'cancelled' });

      setOpen(false);
      router.refresh();
    } catch (error) {
      setError(getApiErrorMessage(error, 'No se pudo cancelar la diffusion'));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="xs"
        className="h-5 rounded-full px-2"
        onClick={() => setOpen(true)}
      >
        Cancelar
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar diffusion</DialogTitle>
            <DialogDescription>
              ¿Seguro que quieres cancelar la diffusion #{diffusion.id}? Los leads pendientes ya no
              se enviarán.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={cancelling}>
              Volver
            </Button>
            <Button variant="destructive" onClick={onCancel} disabled={cancelling}>
              {cancelling ? 'Cancelando...' : 'Cancelar diffusion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CancelDiffusionButton;
