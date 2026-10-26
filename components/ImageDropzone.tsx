'use client';

import { IconPhotoPlus, IconX } from '@tabler/icons-react';
import { useDropzone } from 'react-dropzone';

import { Button } from '@/components/ui/button';
import { IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/app/templates/schemas';
import { cn } from '@/lib/utils';

interface Props {
  id?: string;
  previewUrl: string | null;
  invalid?: boolean;
  onSelect: (file: File) => void;
  onRemove: () => void;
  onReject: () => void;
}

const ACCEPT = Object.fromEntries(IMAGE_TYPES.map((type) => [type, []]));

const ImageDropzone = ({ id, previewUrl, invalid, onSelect, onRemove, onReject }: Props) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPT,
    maxSize: MAX_IMAGE_SIZE,
    multiple: false,
    onDropAccepted: ([file]) => onSelect(file),
    onDropRejected: onReject,
  });

  return (
    <div
      {...getRootProps({
        className: cn(
          'relative flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed text-center text-sm transition-colors',
          isDragActive ? 'border-ring bg-accent' : 'hover:bg-accent/50',
          invalid && 'border-destructive',
        ),
      })}
    >
      <input id={id} {...getInputProps()} />
      {previewUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Vista previa" className="size-full object-contain" />
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="absolute top-2 right-2"
            aria-label="Quitar imagen"
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
          >
            <IconX />
          </Button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 px-4">
          <IconPhotoPlus size={28} />
          <span>Arrastra una imagen o haz click para buscarla</span>
          <span className="text-muted-foreground">png, jpg, webp o gif, máximo 5 MB</span>
        </div>
      )}
    </div>
  );
};

export default ImageDropzone;
