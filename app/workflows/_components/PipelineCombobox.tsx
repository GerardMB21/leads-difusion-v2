'use client';

import { useState } from 'react';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import type { PipelineOption } from '../schemas';

interface Props {
  id?: string;
  value: PipelineOption | null;
  options: PipelineOption[];
  invalid?: boolean;
  onChange: (value: PipelineOption | null) => void;
}

const sameName = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

const PipelineCombobox = ({ id, value, options, invalid, onChange }: Props) => {
  const [query, setQuery] = useState('');

  const name = query.trim();
  const known =
    value && !options.some((o) => sameName(o.name, value.name)) ? [...options, value] : options;
  const isNew = name !== '' && !known.some((o) => sameName(o.name, name));
  const items = isNew ? [...known, { id: null, name }] : known;

  return (
    <Combobox
      autoHighlight
      items={items}
      value={value}
      itemToStringLabel={(item: PipelineOption) => item.name}
      isItemEqualToValue={(a: PipelineOption, b: PipelineOption) => sameName(a.name, b.name)}
      onInputValueChange={setQuery}
      onValueChange={onChange}
    >
      <ComboboxInput id={id} aria-invalid={invalid} placeholder="Busca o escribe para crear" />
      <ComboboxContent>
        <ComboboxEmpty>Escribe para crear un pipeline</ComboboxEmpty>
        <ComboboxList>
          {(item: PipelineOption) => (
            <ComboboxItem key={item.id ?? `new-${item.name}`} value={item}>
              {item.id === null && isNew && item.name === name ? `Crear "${item.name}"` : item.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export default PipelineCombobox;
