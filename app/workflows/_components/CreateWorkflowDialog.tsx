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
import WorkflowForm from './WorkflowForm';

const CreateWorkflowDialog = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="flex items-center justify-center gap-1">
            <IconPlus size={16} />
            Workflow
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo workflow</DialogTitle>
          <DialogDescription>
            Mueve los leads de un pipeline a otro según su respuesta.
          </DialogDescription>
        </DialogHeader>
        <WorkflowForm
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkflowDialog;
