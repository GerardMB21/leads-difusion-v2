'use client';

import { useEffect } from 'react';

import ErrorPage from '@/components/ErrorPage';
import { Button } from '@/components/ui/button';

type Props = {
  error: unknown;
  retry: () => void;
};

export default function Error({ error, retry }: Props) {
  useEffect(() => {
    console.error('Pipelines error: ', error);
  }, [error]);

  const message =
    error instanceof globalThis.Error
      ? error.message
      : 'Error de respuesta en la pagina, contacta con el area de soporte';

  return (
    <>
      <ErrorPage error={{ status: 500, message }} />
      <div className="flex justify-center">
        <Button variant="outline" onClick={() => retry()}>
          Reintentar
        </Button>
      </div>
    </>
  );
}
