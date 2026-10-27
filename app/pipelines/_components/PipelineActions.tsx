'use client';

import type { Pipeline } from '../types';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconCirclePlus, IconDots, IconPencil, IconTrash } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api, getApiErrorMessage } from '@/lib/api';
import LeadForm from '@/components/LeadForm';
import PipelineForm from './PipelineForm';

const PipelineActions = ({ pipeline }: { pipeline: Pipeline }) => {
  const router = useRouter();
  const [leadOpen, setLeadOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const onDelete = async () => {
    setDeleting(true);
    setDeleteError(null);

    try {
      await api.delete(`/pipelines/${pipeline.id}`);

      setDeleteOpen(false);
      router.refresh();
    } catch (error) {
      setDeleteError(getApiErrorMessage(error, 'No se pudo eliminar el pipeline'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-xs" aria-label="Acciones del pipeline" />}
        >
          <IconDots />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setLeadOpen(true)}>
            <IconCirclePlus />
            Lead
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <IconPencil />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            <IconTrash />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={leadOpen} onOpenChange={setLeadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo lead</DialogTitle>
            <DialogDescription>Se agregará al pipeline {pipeline.name}.</DialogDescription>
          </DialogHeader>
          <LeadForm
            pipeline={pipeline}
            onSuccess={() => {
              setLeadOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar pipeline</DialogTitle>
            <DialogDescription>Modifica los datos de {pipeline.name}.</DialogDescription>
          </DialogHeader>
          <PipelineForm
            pipeline={pipeline}
            onSuccess={() => {
              setEditOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar pipeline</DialogTitle>
            <DialogDescription>
              ¿Seguro que quieres eliminar {pipeline.name}? Esta acción lo quita del tablero.
            </DialogDescription>
          </DialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={onDelete} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PipelineActions;
