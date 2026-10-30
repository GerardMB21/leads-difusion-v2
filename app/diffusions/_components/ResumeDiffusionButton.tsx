'use client';

import type { DiffusionRow } from '../types';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { api, getApiErrorMessage } from '@/lib/api';

const ResumeDiffusionButton = ({ diffusion }: { diffusion: DiffusionRow }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [retryFailed, setRetryFailed] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onOpen = () => {
    setRetryFailed(false);
    setError(null);
    setOpen(true);
  };

  const onResume = async () => {
    setResuming(true);
    setError(null);

    try {
      await api.post(`/diffusions/${diffusion.id}/resume`, { retryFailed });

      setOpen(false);
      router.refresh();
    } catch (error) {
      setError(getApiErrorMessage(error, 'No se pudo reanudar la diffusion'));
    } finally {
      setResuming(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="xs" className="h-5 rounded-full px-2" onClick={onOpen}>
        Reanudar
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reanudar diffusion</DialogTitle>
            <DialogDescription>
              ¿Seguro que quieres reanudar la diffusion #{diffusion.id}? Los leads pendientes se
              enviarán a partir de ahora.
            </DialogDescription>
          </DialogHeader>
          {diffusion.failed > 0 && (
            <Field orientation="horizontal">
              <Checkbox
                id={`retry-failed-${diffusion.id}`}
                checked={retryFailed}
                onCheckedChange={setRetryFailed}
              />
              <FieldLabel htmlFor={`retry-failed-${diffusion.id}`}>
                Reintentar leads fallidos ({diffusion.failed})
              </FieldLabel>
            </Field>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={resuming}>
              Volver
            </Button>
            <Button onClick={onResume} disabled={resuming}>
              {resuming ? 'Reanudando...' : 'Reanudar diffusion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResumeDiffusionButton;
