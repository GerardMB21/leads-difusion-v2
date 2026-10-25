'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useStore } from '../_store';
import PipelineForm from './PipelineForm';

const Header = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const pipelinesCount = useStore((state) => state.data.length);

  return (
    <div className="flex items-center justify-end px-4 pt-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button />}>+Pipeline</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo pipeline</DialogTitle>
            <DialogDescription>
              Define el nombre y la posición de la nueva columna.
            </DialogDescription>
          </DialogHeader>
          <PipelineForm
            defaultOrder={pipelinesCount}
            onSuccess={() => {
              setOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Header;
