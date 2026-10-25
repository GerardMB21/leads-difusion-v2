'use client';

import type { Pipeline } from '../types';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { api, getApiErrorMessage } from '@/lib/api';
import { createPipelineSchema, type CreatePipelineInput } from '../schemas';

interface Props {
  defaultOrder?: number;
  pipeline?: Pipeline;
  onSuccess: () => void;
}

const PipelineForm = ({ defaultOrder = 0, pipeline, onSuccess }: Props) => {
  const isEditing = !!pipeline;

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreatePipelineInput>({
    resolver: zodResolver(createPipelineSchema),
    defaultValues: pipeline
      ? { name: pipeline.name, order: pipeline.order, default: pipeline.default }
      : { name: '', order: defaultOrder, default: false },
  });

  const onSubmit = async (values: CreatePipelineInput) => {
    try {
      if (pipeline) await api.patch(`/pipelines/${pipeline.id}`, values);
      else await api.post('/pipelines', values);

      onSuccess();
    } catch (error) {
      setError('root', {
        message: getApiErrorMessage(
          error,
          isEditing ? 'No se pudo actualizar el pipeline' : 'No se pudo crear el pipeline',
        ),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="pipeline-name">Nombre</FieldLabel>
          <Input id="pipeline-name" aria-invalid={!!errors.name} {...register('name')} />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field data-invalid={!!errors.order}>
          <FieldLabel htmlFor="pipeline-order">Orden</FieldLabel>
          <Input
            id="pipeline-order"
            type="number"
            min={0}
            aria-invalid={!!errors.order}
            {...register('order', { valueAsNumber: true })}
          />
          <FieldError errors={[errors.order]} />
        </Field>
        <Controller
          control={control}
          name="default"
          render={({ field }) => (
            <Field orientation="horizontal">
              <Checkbox
                id="pipeline-default"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <FieldLabel htmlFor="pipeline-default">Pipeline por defecto</FieldLabel>
            </Field>
          )}
        />
        <FieldError errors={[errors.root]} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear pipeline'}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default PipelineForm;
