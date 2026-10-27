'use client';

import type { Lead, LeadTag, Pipeline } from '@/app/pipelines/types';
import type { LeadPipeline } from '@/app/leads/types';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { leadFormSchema, type LeadFormInput } from '@/app/leads/schemas';
import FilterCombobox from '@/components/FilterCombobox';
import TagsCombobox from '@/components/TagsCombobox';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { api, getApiErrorMessage } from '@/lib/api';

const LEAD_CREATE_TIMEOUT = 10_000;

interface Props {
  pipeline?: Pipeline;
  pipelines?: LeadPipeline[];
  lead?: Pick<Lead, 'id' | 'contactName' | 'phone' | 'enrollmentDate' | 'tags'>;
  onSuccess: () => void;
}

const LeadForm = ({ pipeline, pipelines, lead, onSuccess }: Props) => {
  const isEditing = !!lead;
  const choosesPipeline = !lead && !pipeline;
  const [tagOptions, setTagOptions] = useState<string[]>([]);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<LeadFormInput>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      pipelineId: pipeline ? String(pipeline.id) : undefined,
      contactName: lead?.contactName ?? '',
      phone: lead?.phone ?? '',
      enrollmentDate: (lead ? new Date(lead.enrollmentDate) : new Date()).toLocaleDateString(
        'en-CA',
      ),
      tags: lead?.tags.map(({ name }) => name) ?? [],
    },
  });

  useEffect(() => {
    api
      .get<LeadTag[]>('/tags')
      .then(({ data }) => setTagOptions(data.map(({ name }) => name)))
      .catch(() => setTagOptions([]));
  }, []);

  const onSubmit = async ({ enrollmentDate, tags, pipelineId, ...values }: LeadFormInput) => {
    if (choosesPipeline && !pipelineId) {
      setError('pipelineId', { message: 'Selecciona un pipeline' });

      return;
    }

    try {
      if (lead) {
        await api.patch(
          `/leads/${lead.id}`,
          {
            ...values,
            ...(dirtyFields.enrollmentDate && {
              enrollmentDate: new Date(`${enrollmentDate}T00:00:00`).toISOString(),
            }),
            tagNames: tags,
          },
          { timeout: LEAD_CREATE_TIMEOUT },
        );
      } else {
        await api.post(
          '/leads',
          {
            ...values,
            ...(pipeline && { order: pipeline.leads.length }),
            pipelineId: pipeline ? pipeline.id : Number(pipelineId),
            enrollmentDate: new Date(`${enrollmentDate}T00:00:00`).toISOString(),
            tagNames: tags,
          },
          { timeout: LEAD_CREATE_TIMEOUT },
        );
      }

      onSuccess();
    } catch (error) {
      setError('root', {
        message: getApiErrorMessage(
          error,
          isEditing ? 'No se pudo actualizar el lead' : 'No se pudo crear el lead',
        ),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        {choosesPipeline && (
          <Controller
            control={control}
            name="pipelineId"
            render={({ field }) => (
              <Field data-invalid={!!errors.pipelineId}>
                <FieldLabel htmlFor="lead-pipeline">Pipeline</FieldLabel>
                <FilterCombobox
                  searchable
                  clearable={false}
                  id="lead-pipeline"
                  className="w-full"
                  label="Pipeline"
                  placeholder="Selecciona un pipeline"
                  value={field.value ?? null}
                  options={(pipelines ?? []).map(({ id, name }) => ({
                    value: String(id),
                    label: name,
                  }))}
                  onChange={(value) => field.onChange(value ?? undefined)}
                />
                <FieldError errors={[errors.pipelineId]} />
              </Field>
            )}
          />
        )}
        <Field data-invalid={!!errors.contactName}>
          <FieldLabel htmlFor="lead-name">Nombre</FieldLabel>
          <Input id="lead-name" aria-invalid={!!errors.contactName} {...register('contactName')} />
          <FieldError errors={[errors.contactName]} />
        </Field>
        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="lead-phone">Teléfono</FieldLabel>
          <Input id="lead-phone" type="tel" aria-invalid={!!errors.phone} {...register('phone')} />
          <FieldError errors={[errors.phone]} />
        </Field>
        <Field data-invalid={!!errors.enrollmentDate}>
          <FieldLabel htmlFor="lead-date">Fecha de ingreso</FieldLabel>
          <Input
            id="lead-date"
            type="date"
            aria-invalid={!!errors.enrollmentDate}
            {...register('enrollmentDate')}
          />
          <FieldError errors={[errors.enrollmentDate]} />
        </Field>
        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <Field data-invalid={!!errors.tags}>
              <FieldLabel htmlFor="lead-tags">Etiquetas</FieldLabel>
              <TagsCombobox
                id="lead-tags"
                value={field.value}
                options={tagOptions}
                onChange={field.onChange}
              />
              <FieldError errors={[errors.tags?.root]} />
            </Field>
          )}
        />
        <FieldError errors={[errors.root]} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear lead'}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default LeadForm;
