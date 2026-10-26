'use client';

import type { DiffusionLead } from '../types';

import { useEffect, useRef, useState } from 'react';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { api } from '@/lib/api';

const SEARCH_DEBOUNCE = 300;

interface Props {
  id?: string;
  value: DiffusionLead[];
  pipelineId: string | null;
  tagIds: number[];
  invalid?: boolean;
  onChange: (value: DiffusionLead[]) => void;
}

const label = (lead: DiffusionLead) => `${lead.contactName} · ${lead.phone}`;

const toLeads = (rows: DiffusionLead[]) =>
  rows.map(({ id, contactName, phone }) => ({ id, contactName, phone }));

const LeadsCombobox = ({ id, value, pipelineId, tagIds, invalid, onChange }: Props) => {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<DiffusionLead[]>([]);
  const [searchResults, setSearchResults] = useState<DiffusionLead[]>([]);
  const [loading, setLoading] = useState(false);

  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const search = query.trim();
  const tagKey = tagIds.join(',');
  const hasCriteria = !!pipelineId || tagIds.length > 0;

  const fetchLeads = async (text: string) => {
    const { data } = await api.get<DiffusionLead[]>('/leads', {
      params: {
        ...(pipelineId && { pipelineId }),
        ...(tagKey && { tagIds: tagKey }),
        ...(text && { search: text }),
      },
    });

    return toLeads(data);
  };

  // Picking a pipeline or tags selects every lead that matches all of them. With neither, the
  // selection is emptied.
  useEffect(() => {
    if (!hasCriteria) {
      onChangeRef.current([]);

      return;
    }

    let stale = false;

    (async () => {
      setLoading(true);

      try {
        const leads = await fetchLeads('');

        if (stale) return;

        setMatches(leads);
        onChangeRef.current(leads);
      } catch {
        if (!stale) {
          setMatches([]);
          onChangeRef.current([]);
        }
      } finally {
        if (!stale) setLoading(false);
      }
    })();

    return () => {
      stale = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCriteria, pipelineId, tagKey]);

  // Typing searches inside the current pipeline and tags, or in every lead when there are none.
  useEffect(() => {
    if (!search) return;

    let stale = false;

    const timeout = setTimeout(async () => {
      setLoading(true);

      try {
        const leads = await fetchLeads(search);

        if (!stale) setSearchResults(leads);
      } catch {
        if (!stale) setSearchResults([]);
      } finally {
        if (!stale) setLoading(false);
      }
    }, SEARCH_DEBOUNCE);

    return () => {
      stale = true;
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, pipelineId, tagKey]);

  let results: DiffusionLead[] = [];

  if (search) results = searchResults;
  else if (hasCriteria) results = matches;

  const items = [...value, ...results.filter((lead) => !value.some((v) => v.id === lead.id))];

  let emptyText = 'Sin resultados';

  if (!hasCriteria && !search) emptyText = 'Escribe algo para buscar leads';
  else if (loading) emptyText = 'Buscando...';

  const placeholder = value.length
    ? `${value.length} lead${value.length === 1 ? '' : 's'} seleccionado${value.length === 1 ? '' : 's'}`
    : 'Escribe para buscar leads';

  return (
    <Combobox
      multiple
      autoHighlight
      filter={null}
      items={items}
      value={value}
      inputValue={query}
      itemToStringLabel={label}
      isItemEqualToValue={(a: DiffusionLead, b: DiffusionLead) => a.id === b.id}
      onInputValueChange={setQuery}
      onValueChange={onChange}
      onOpenChange={(open) => {
        if (!open) setQuery('');
      }}
    >
      <ComboboxInput id={id} aria-invalid={invalid} placeholder={placeholder} />
      <ComboboxContent>
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxList>
          {(item: DiffusionLead) => (
            <ComboboxItem key={item.id} value={item}>
              {label(item)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export default LeadsCombobox;
