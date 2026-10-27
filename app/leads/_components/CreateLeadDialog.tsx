'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconPlus } from '@tabler/icons-react';

import LeadForm from '@/components/LeadForm';
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

const CreateLeadDialog = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const pipelines = useStore((state) => state.pipelines);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="flex items-center justify-center gap-1">
            <IconPlus size={16} />
            Lead
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo lead</DialogTitle>
          <DialogDescription>Elige el pipeline al que se agregará.</DialogDescription>
        </DialogHeader>
        <LeadForm
          pipelines={pipelines}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateLeadDialog;
