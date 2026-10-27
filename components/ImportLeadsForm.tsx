'use client';

import type { ImportLeadsResult } from '@/app/leads/types';
import type { LeadTag, Pipeline } from '@/app/pipelines/types';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconFileSpreadsheet, IconUpload } from '@tabler/icons-react';
import { useDropzone } from 'react-dropzone';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import TagsCombobox from '@/components/TagsCombobox';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { api, getApiErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const IMPORT_TIMEOUT = 60_000;
const ACCEPT = {
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
};

const formSchema = z.object({
  file: z.instanceof(File, { error: 'Selecciona un archivo' }),
  pipelineId: z.string().min(1, 'Selecciona un pipeline'),
  tags: z.array(z.string()),
});

type FormInput = z.infer<typeof formSchema>;

type PipelineItem = { value: string; label: string };

type PipelineOption = Pick<Pipeline, 'id' | 'name' | 'default'>;

interface Props {
  onSuccess: (result: ImportLeadsResult) => void;
}

const stripExtension = (name: string) => name.replace(/\.[^.]+$/, '').trim();

const ImportLeadsForm = ({ onSuccess }: Props) => {
  const [pipelines, setPipelines] = useState<PipelineOption[]>([]);
  const [tagOptions, setTagOptions] = useState<string[]>([]);
  const pipelineItems = pipelines.map(({ id, name }) => ({ value: String(id), label: name }));
  const [fileTag, setFileTag] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: { pipelineId: '', tags: [] },
  });

  useEffect(() => {
    api
      .get<PipelineOption[]>('/pipelines')
      .then(({ data }) => {
        setPipelines(data);

        const preferred = data.find(({ default: isDefault }) => isDefault);

        if (preferred && !getValues('pipelineId')) setValue('pipelineId', String(preferred.id));
      })
      .catch(() => setPipelines([]));

    api
      .get<LeadTag[]>('/tags')
      .then(({ data }) => setTagOptions(data.map(({ name }) => name)))
      .catch(() => setTagOptions([]));
  }, [getValues, setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPT,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    onDropAccepted: ([file]) => {
      const nextTag = stripExtension(file.name);
      const withoutPrevious = getValues('tags').filter((tag) => tag !== fileTag);

      setValue('file', file, { shouldValidate: true });
      setValue('tags', nextTag ? [...withoutPrevious, nextTag] : withoutPrevious);
      setFileTag(nextTag || null);
    },
    onDropRejected: () =>
      setError('file', { message: 'Solo se permite un archivo .xlsx o .csv de hasta 5 MB' }),
  });

  const onSubmit = async ({ file, pipelineId, tags }: FormInput) => {
    const body = new FormData();

    body.append('file', file);
    body.append('pipelineId', pipelineId);
    body.append('tagNames', JSON.stringify(tags));

    try {
      const { data } = await api.post<ImportLeadsResult>('/leads/import', body, {
        timeout: IMPORT_TIMEOUT,
      });

      onSuccess(data);
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error, 'No se pudieron importar los leads') });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Controller
          control={control}
          name="file"
          render={({ field }) => (
            <Field data-invalid={!!errors.file}>
              <FieldLabel htmlFor="import-file">Archivo</FieldLabel>
              <div
                {...getRootProps({
                  className: cn(
                    'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center text-sm transition-colors',
                    isDragActive ? 'border-ring bg-accent' : 'hover:bg-accent/50',
                    errors.file && 'border-destructive',
                  ),
                })}
              >
                <input id="import-file" {...getInputProps()} onFocus={() => clearErrors('file')} />
                {field.value ? (
                  <>
                    <IconFileSpreadsheet size={28} />
                    <span className="font-medium">{field.value.name}</span>
                    <span className="text-muted-foreground">
                      Suelta otro archivo para cambiarlo
                    </span>
                  </>
                ) : (
                  <>
                    <IconUpload size={28} />
                    <span>Arrastra un archivo o haz click para buscarlo</span>
                    <span className="text-muted-foreground">.xlsx o .csv, máximo 5 MB</span>
                  </>
                )}
              </div>
              <FieldError errors={[errors.file]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="pipelineId"
          render={({ field }) => (
            <Field data-invalid={!!errors.pipelineId}>
              <FieldLabel htmlFor="import-pipeline">Pipeline de destino</FieldLabel>
              <Combobox
                items={pipelineItems}
                value={pipelineItems.find(({ value }) => value === field.value) ?? null}
                onValueChange={(item) => field.onChange(item?.value ?? '')}
              >
                <ComboboxInput
                  id="import-pipeline"
                  placeholder="Busca un pipeline"
                  aria-invalid={!!errors.pipelineId}
                />
                <ComboboxContent>
                  <ComboboxEmpty>No se encontraron pipelines</ComboboxEmpty>
                  <ComboboxList>
                    {(item: PipelineItem) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              <FieldError errors={[errors.pipelineId]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="import-tags">Etiquetas para todos los leads</FieldLabel>
              <TagsCombobox
                id="import-tags"
                value={field.value}
                options={tagOptions}
                onChange={field.onChange}
              />
            </Field>
          )}
        />
        <FieldError errors={[errors.root]} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Importando...' : 'Importar leads'}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default ImportLeadsForm;
