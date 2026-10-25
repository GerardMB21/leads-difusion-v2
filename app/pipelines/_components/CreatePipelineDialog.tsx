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
import { useStore } from '../_store';
import PipelineForm from './PipelineForm';

const CreatePipelineDialog = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const pipelinesCount = useStore((state) => state.data.length);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="flex items-center justify-center gap-1">
            <IconPlus size={16} />
            Pipeline
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo pipeline</DialogTitle>
          <DialogDescription>Define el nombre y la posición de la nueva columna.</DialogDescription>
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
  );
};

export default CreatePipelineDialog;
