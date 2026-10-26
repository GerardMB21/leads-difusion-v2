'use client';

import type { KeyboardEvent } from 'react';
import type { CreateWorkflowInput, PipelineOption, UpdateWorkflowInput } from '../schemas';
import type { WorkflowRow } from '../types';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { api, getApiErrorMessage } from '@/lib/api';
import { useStore } from '../_store';
import { MAX_HOURS, workflowFormSchema, type WorkflowFormInput } from '../schemas';
import PipelineCombobox from './PipelineCombobox';
import TriggerCombobox from './TriggerCombobox';

interface Props {
  workflow?: WorkflowRow;
  onSuccess: () => void;
}

const BLOCKED_KEYS = ['.', ',', 'e', 'E', '+', '-'];

const blockNonInteger = (event: KeyboardEvent<HTMLInputElement>) => {
  if (BLOCKED_KEYS.includes(event.key)) event.preventDefault();
};

const toPipelineFields = (side: 'from' | 'to', option: PipelineOption | null) =>
  option?.id != null
    ? { [`${side}PipelineId`]: option.id }
    : { [`${side}PipelineName`]: option!.name };

const WorkflowForm = ({ workflow, onSuccess }: Props) => {
  const isEditing = !!workflow;
  const pipelines = useStore((state) => state.pipelines);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<WorkflowFormInput>({
    resolver: zodResolver(workflowFormSchema),
    defaultValues: {
      name: workflow?.name ?? '',
      from: workflow?.fromPipeline ?? null,
      to: workflow?.toPipeline ?? null,
      trigger: workflow?.whenSendMessage ? 'sendMessage' : 'notResponse',
      hours: workflow ? Math.floor(workflow.waitingTime / 60) : 0,
      minutes: workflow ? workflow.waitingTime % 60 : 0,
    },
  });

  const onSubmit = async ({ name, from, to, trigger, hours, minutes }: WorkflowFormInput) => {
    const body: CreateWorkflowInput & UpdateWorkflowInput = {
      name,
      ...toPipelineFields('from', from),
      ...toPipelineFields('to', to),
      whenNotResponse: trigger === 'notResponse',
      whenSendMessage: trigger === 'sendMessage',
      waitingTime: hours * 60 + minutes,
    };

    try {
      if (workflow) await api.patch(`/workflows/${workflow.id}`, body);
      else await api.post('/workflows', body);

      onSuccess();
    } catch (error) {
      setError('root', {
        message: getApiErrorMessage(
          error,
          isEditing ? 'No se pudo actualizar el workflow' : 'No se pudo crear el workflow',
        ),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="workflow-name">Nombre</FieldLabel>
          <Input id="workflow-name" aria-invalid={!!errors.name} {...register('name')} />
          <FieldError errors={[errors.name]} />
        </Field>
        <Controller
          control={control}
          name="from"
          render={({ field }) => (
            <Field data-invalid={!!errors.from}>
              <FieldLabel htmlFor="workflow-from">Pipeline origen</FieldLabel>
              <PipelineCombobox
                id="workflow-from"
                value={field.value}
                options={pipelines}
                invalid={!!errors.from}
                onChange={field.onChange}
              />
              <FieldError errors={[errors.from]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="to"
          render={({ field }) => (
            <Field data-invalid={!!errors.to}>
              <FieldLabel htmlFor="workflow-to">Pipeline destino</FieldLabel>
              <PipelineCombobox
                id="workflow-to"
                value={field.value}
                options={pipelines}
                invalid={!!errors.to}
                onChange={field.onChange}
              />
              <FieldError errors={[errors.to]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="trigger"
          render={({ field }) => (
            <Field data-invalid={!!errors.trigger}>
              <FieldLabel htmlFor="workflow-trigger">Se activa</FieldLabel>
              <TriggerCombobox
                id="workflow-trigger"
                value={field.value}
                onChange={field.onChange}
              />
              <FieldError errors={[errors.trigger]} />
            </Field>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!errors.hours}>
            <FieldLabel htmlFor="workflow-hours">Horas</FieldLabel>
            <Input
              id="workflow-hours"
              type="number"
              inputMode="numeric"
              min={0}
              max={MAX_HOURS}
              step={1}
              aria-invalid={!!errors.hours}
              onKeyDown={blockNonInteger}
              {...register('hours', { valueAsNumber: true })}
            />
            <FieldError errors={[errors.hours]} />
          </Field>
          <Field data-invalid={!!errors.minutes}>
            <FieldLabel htmlFor="workflow-minutes">Minutos</FieldLabel>
            <Input
              id="workflow-minutes"
              type="number"
              inputMode="numeric"
              min={0}
              max={59}
              step={1}
              aria-invalid={!!errors.minutes}
              onKeyDown={blockNonInteger}
              {...register('minutes', { valueAsNumber: true })}
            />
            <FieldError errors={[errors.minutes]} />
          </Field>
        </div>
        <FieldError errors={[errors.root]} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear workflow'}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default WorkflowForm;
