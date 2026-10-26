'use client';

import type { WorkflowRow } from '../types';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconDots, IconPencil, IconTrash } from '@tabler/icons-react';

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
import WorkflowForm from './WorkflowForm';

const WorkflowActions = ({ workflow }: { workflow: WorkflowRow }) => {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const onDelete = async () => {
    setDeleting(true);
    setDeleteError(null);

    try {
      await api.delete(`/workflows/${workflow.id}`);

      setDeleteOpen(false);
      router.refresh();
    } catch (error) {
      setDeleteError(getApiErrorMessage(error, 'No se pudo eliminar el workflow'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-xs" aria-label="Acciones del workflow" />}
        >
          <IconDots />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar workflow</DialogTitle>
            <DialogDescription>Modifica los datos de {workflow.name}.</DialogDescription>
          </DialogHeader>
          <WorkflowForm
            workflow={workflow}
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
            <DialogTitle>Eliminar workflow</DialogTitle>
            <DialogDescription>
              ¿Seguro que quieres eliminar {workflow.name}? Esta acción lo quita del sistema.
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

export default WorkflowActions;
