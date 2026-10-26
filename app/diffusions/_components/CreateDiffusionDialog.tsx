'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconPlus } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import DiffusionForm from './DiffusionForm';

const CreateDiffusionDialog = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="flex items-center justify-center gap-1">
            <IconPlus size={16} />
            Diffusion
          </Button>
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva diffusion</DialogTitle>
          <DialogDescription>
            Elige los leads y los templates que se enviarán, y opcionalmente cuándo empieza.
          </DialogDescription>
        </DialogHeader>
        <DiffusionForm
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateDiffusionDialog;
