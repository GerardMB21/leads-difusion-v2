'use client';

import { Fragment } from 'react';

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

type Option = { id: number; name: string };

interface Props {
  id?: string;
  value: number[];
  options: Option[];
  placeholder: string;
  emptyText: string;
  onChange: (value: number[]) => void;
}

const MultiCombobox = ({ id, value, options, placeholder, emptyText, onChange }: Props) => {
  const anchor = useComboboxAnchor();
  const selected = options.filter((option) => value.includes(option.id));

  return (
    <Combobox
      multiple
      autoHighlight
      items={options}
      value={selected}
      itemToStringLabel={(item: Option) => item.name}
      isItemEqualToValue={(a: Option, b: Option) => a.id === b.id}
      onValueChange={(next: Option[]) => onChange(next.map((option) => option.id))}
    >
      <ComboboxChips ref={anchor}>
        <ComboboxValue>
          {(items: Option[]) => (
            <Fragment>
              {items.map((item) => (
                <ComboboxChip key={item.id}>{item.name}</ComboboxChip>
              ))}
              <ComboboxChipsInput id={id} placeholder={items.length ? '' : placeholder} />
            </Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxList>
          {(item: Option) => (
            <ComboboxItem key={item.id} value={item}>
              {item.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export default MultiCombobox;
