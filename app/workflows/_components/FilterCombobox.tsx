'use client';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';

export type FilterOption = {
  value: string;
  label: string;
};

interface Props {
  label: string;
  placeholder: string;
  value: string | null;
  options: FilterOption[];
  searchable?: boolean;
  onChange: (value: string | null) => void;
}

const FilterCombobox = ({
  label,
  placeholder,
  value,
  options,
  searchable = false,
  onChange,
}: Props) => (
  <Combobox
    openOnInputClick={!searchable}
    autoHighlight={searchable}
    items={options}
    value={options.find((o) => o.value === value) ?? null}
    itemToStringLabel={(item: FilterOption) => item.label}
    isItemEqualToValue={(a: FilterOption, b: FilterOption) => a.value === b.value}
    onValueChange={(next: FilterOption | null) => onChange(next?.value ?? null)}
  >
    <ComboboxInput
      aria-label={label}
      placeholder={placeholder}
      readOnly={!searchable}
      showClear={value !== null}
      className="w-full sm:w-52"
    />
    <ComboboxContent>
      <ComboboxEmpty>Sin resultados</ComboboxEmpty>
      <ComboboxList>
        {(item: FilterOption) => (
          <ComboboxItem key={item.value} value={item}>
            {item.label}
          </ComboboxItem>
        )}
      </ComboboxList>
    </ComboboxContent>
  </Combobox>
);

export default FilterCombobox;
