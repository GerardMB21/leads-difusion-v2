'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';

import FilterCombobox from '@/components/FilterCombobox';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { api, getApiErrorMessage } from '@/lib/api';
import { useStore } from '../_store';
import { diffusionFormSchema, limaToIso, type DiffusionFormInput } from '../schemas';
import LeadsCombobox from './LeadsCombobox';
import MultiCombobox from './MultiCombobox';

const CREATE_TIMEOUT = 30_000;

interface Props {
  onSuccess: () => void;
}

const DiffusionForm = ({ onSuccess }: Props) => {
  const { pipelines, tags, templates } = useStore((state) => state);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DiffusionFormInput>({
    resolver: zodResolver(diffusionFormSchema),
    defaultValues: {
      pipelineId: null,
      tagIds: [],
      leads: [],
      templateIds: templates.map(({ id }) => id),
      startAt: '',
    },
  });

  const pipelineId = useWatch({ control, name: 'pipelineId' });
  const tagIds = useWatch({ control, name: 'tagIds' });

  const onSubmit = async ({
    pipelineId,
    tagIds,
    leads,
    templateIds,
    startAt,
  }: DiffusionFormInput) => {
    if (!leads.length) {
      setError('leads', { message: 'Selecciona al menos un lead' });

      return;
    }

    if (!templateIds.length) {
      setError('templateIds', { message: 'Selecciona al menos un template' });

      return;
    }

    try {
      await api.post(
        '/diffusions',
        {
          pipelineId: pipelineId ? Number(pipelineId) : null,
          tagIds,
          templateIds,
          leadIds: leads.map(({ id }) => id),
          startAt: startAt ? limaToIso(startAt) : null,
        },
        { timeout: CREATE_TIMEOUT },
      );

      onSuccess();
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error, 'No se pudo crear la diffusion') });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Controller
          control={control}
          name="pipelineId"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="diffusion-pipeline">Pipeline (opcional)</FieldLabel>
              <FilterCombobox
                searchable
                id="diffusion-pipeline"
                className="w-full"
                label="Pipeline"
                placeholder="Todos los pipelines"
                value={field.value}
                options={pipelines.map(({ id, name }) => ({ value: String(id), label: name }))}
                onChange={field.onChange}
              />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="tagIds"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="diffusion-tags">Etiquetas (opcional)</FieldLabel>
              <MultiCombobox
                id="diffusion-tags"
                value={field.value}
                options={tags}
                placeholder="Busca etiquetas"
                emptyText="Sin etiquetas"
                onChange={field.onChange}
              />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="leads"
          render={({ field }) => (
            <Field data-invalid={!!errors.leads}>
              <FieldLabel htmlFor="diffusion-leads">Leads</FieldLabel>
              <LeadsCombobox
                id="diffusion-leads"
                value={field.value}
                pipelineId={pipelineId}
                tagIds={tagIds}
                invalid={!!errors.leads}
                onChange={field.onChange}
              />
              <FieldError errors={[errors.leads]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="templateIds"
          render={({ field }) => (
            <Field data-invalid={!!errors.templateIds}>
              <FieldLabel htmlFor="diffusion-templates">Templates</FieldLabel>
              <MultiCombobox
                id="diffusion-templates"
                value={field.value}
                options={templates}
                placeholder="Busca templates"
                emptyText="Sin templates"
                onChange={field.onChange}
              />
              <FieldError errors={[errors.templateIds]} />
            </Field>
          )}
        />
        <Field data-invalid={!!errors.startAt}>
          <FieldLabel htmlFor="diffusion-start">Inicio (opcional)</FieldLabel>
          <Input
            id="diffusion-start"
            type="datetime-local"
            aria-invalid={!!errors.startAt}
            {...register('startAt')}
          />
          <FieldDescription>Hora de Lima (UTC-5).</FieldDescription>
          <FieldError errors={[errors.startAt]} />
        </Field>
        <FieldError errors={[errors.root]} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creando...' : 'Crear diffusion'}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default DiffusionForm;
