'use client';

import type { Template } from '../types';

import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import ImageDropzone from '@/components/ImageDropzone';
import RichTextEditor from '@/components/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { api, getApiErrorMessage } from '@/lib/api';
import { createTemplateSchema, type CreateTemplateInput } from '../schemas';

const TEMPLATE_SAVE_TIMEOUT = 30_000;

interface Props {
  template?: Template;
  onSuccess: () => void;
}

const TemplateForm = ({ template, onSuccess }: Props) => {
  const isEditing = !!template;
  const [image, setImage] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTemplateInput>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: { name: template?.name ?? '', message: template?.message ?? '' },
  });

  const localUrl = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);

  useEffect(() => {
    if (!localUrl) return;

    return () => URL.revokeObjectURL(localUrl);
  }, [localUrl]);

  const previewUrl = localUrl ?? (imageRemoved ? null : (template?.img ?? null));

  const onSubmit = async (values: CreateTemplateInput) => {
    const body = new FormData();

    body.append('name', values.name);
    body.append('message', values.message);

    if (image) body.append('image', image);
    if (isEditing && imageRemoved && !image) body.append('removeImage', 'true');

    setSubmitError(null);

    try {
      const config = { timeout: TEMPLATE_SAVE_TIMEOUT };

      if (template) await api.patch(`/templates/${template.id}`, body, config);
      else await api.post('/templates', body, config);

      onSuccess();
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(
          error,
          isEditing ? 'No se pudo actualizar el template' : 'No se pudo crear el template',
        ),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="template-name">Nombre</FieldLabel>
          <Input id="template-name" aria-invalid={!!errors.name} {...register('name')} />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field data-invalid={!!imageError}>
          <FieldLabel htmlFor="template-image">Imagen</FieldLabel>
          <ImageDropzone
            id="template-image"
            previewUrl={previewUrl}
            invalid={!!imageError}
            onSelect={(file) => {
              setImageError(null);
              setImage(file);
              setImageRemoved(false);
            }}
            onRemove={() => {
              setImage(null);
              setImageRemoved(true);
            }}
            onReject={() =>
              setImageError('Solo se permite una imagen png, jpg, webp o gif de hasta 5 MB')
            }
          />
          <FieldError>{imageError}</FieldError>
        </Field>
        <Controller
          control={control}
          name="message"
          render={({ field }) => (
            <Field data-invalid={!!errors.message}>
              <FieldLabel htmlFor="template-message">Mensaje</FieldLabel>
              <RichTextEditor
                id="template-message"
                value={field.value}
                invalid={!!errors.message}
                onChange={field.onChange}
              />
              <FieldError errors={[errors.message]} />
            </Field>
          )}
        />
        <FieldError>{submitError}</FieldError>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear template'}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default TemplateForm;
