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

const StopDiffusionButton = ({ diffusion }: { diffusion: DiffusionRow }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onStop = async () => {
    setStopping(true);
    setError(null);

    try {
      await api.post(`/diffusions/${diffusion.id}/stop`);

      setOpen(false);
      router.refresh();
    } catch (error) {
      setError(getApiErrorMessage(error, 'No se pudo detener la diffusion'));
    } finally {
      setStopping(false);
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
        Detener
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detener diffusion</DialogTitle>
            <DialogDescription>
              ¿Seguro que quieres detener la diffusion #{diffusion.id}? Los leads que aún no se han
              procesado quedarán pendientes y podrás reanudar la diffusion más tarde.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={stopping}>
              Volver
            </Button>
            <Button onClick={onStop} disabled={stopping}>
              {stopping ? 'Deteniendo...' : 'Detener diffusion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StopDiffusionButton;
