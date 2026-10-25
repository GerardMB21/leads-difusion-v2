'use client';

import type { NormalizedError } from '@/lib/types';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { createPipelineSchema, type CreatePipelineInput } from '../schemas';

interface Props {
  defaultOrder: number;
  onSuccess: () => void;
}

const PipelineForm = ({ defaultOrder, onSuccess }: Props) => {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreatePipelineInput>({
    resolver: zodResolver(createPipelineSchema),
    defaultValues: { name: '', order: defaultOrder, default: false },
  });

  const onSubmit = async (values: CreatePipelineInput) => {
    try {
      await axios.post('/api/pipelines', values);

      onSuccess();
    } catch (error) {
      const message = axios.isAxiosError<NormalizedError>(error)
        ? error.response?.data.message
        : undefined;

      setError('root', { message: message ?? 'No se pudo crear el pipeline' });
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
          {isSubmitting ? 'Creando...' : 'Crear pipeline'}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default PipelineForm;
