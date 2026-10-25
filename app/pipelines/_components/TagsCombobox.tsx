'use client';

import { Fragment, useState } from 'react';

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';

interface Props {
  id?: string;
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
}

const TagsCombobox = ({ id, value, options, onChange }: Props) => {
  const anchor = useComboboxAnchor();
  const [inputValue, setInputValue] = useState('');

  const query = inputValue.trim();
  const known = [...options, ...value.filter((tag) => !options.includes(tag))];
  const isNew = query !== '' && !known.some((tag) => tag.toLowerCase() === query.toLowerCase());
  const items = isNew ? [...known, query] : known;

  return (
    <Combobox
      multiple
      autoHighlight
      items={items}
      value={value}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
      onValueChange={(next) => {
        onChange(next);
        setInputValue('');
      }}
    >
      <ComboboxChips ref={anchor}>
        <ComboboxValue>
          {(selected: string[]) => (
            <Fragment>
              {selected.map((tag) => (
                <ComboboxChip key={tag}>{tag}</ComboboxChip>
              ))}
              <ComboboxChipsInput id={id} placeholder="Busca o escribe para crear" />
            </Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>Escribe para crear una etiqueta</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {isNew && item === query ? `Crear "${item}"` : item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export default TagsCombobox;
