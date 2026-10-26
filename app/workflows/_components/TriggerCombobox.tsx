'use client';

import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { TRIGGERS, type Trigger } from '../schemas';

type Option = (typeof TRIGGERS)[number];

interface Props {
  id?: string;
  value: Trigger;
  onChange: (value: Trigger) => void;
}

const TriggerCombobox = ({ id, value, onChange }: Props) => (
  <Combobox
    openOnInputClick
    items={TRIGGERS}
    value={TRIGGERS.find((t) => t.value === value) ?? null}
    itemToStringLabel={(item: Option) => item.label}
    isItemEqualToValue={(a: Option, b: Option) => a.value === b.value}
    onValueChange={(next: Option | null) => next && onChange(next.value)}
  >
    <ComboboxInput id={id} readOnly className="cursor-pointer" />
    <ComboboxContent>
      <ComboboxList>
        {(item: Option) => (
          <ComboboxItem key={item.value} value={item}>
            {item.label}
          </ComboboxItem>
        )}
      </ComboboxList>
    </ComboboxContent>
  </Combobox>
);

export default TriggerCombobox;
