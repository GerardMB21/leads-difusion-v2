'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Input } from '@/components/ui/input';
import { useStore } from '../_store';
import { TRIGGERS } from '../schemas';
import FilterCombobox from '@/components/FilterCombobox';

const SEARCH_DEBOUNCE = 300;

const TRIGGER_OPTIONS = TRIGGERS.map(({ value, label }) => ({ value, label }));

const Filters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pipelines = useStore((state) => state.pipelines);

  const urlName = searchParams.get('name') ?? '';
  const [name, setName] = useState(urlName);

  const pipelineOptions = pipelines.map(({ id, name }) => ({ value: String(id), label: name }));

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set(key, value);
    else params.delete(key);

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  useEffect(() => {
    if (name.trim() === urlName) return;

    const timeout = setTimeout(() => setParam('name', name.trim()), SEARCH_DEBOUNCE);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Buscar por nombre"
        aria-label="Buscar por nombre"
        className="w-full sm:w-64"
      />
      <FilterCombobox
        label="Filtrar por activación"
        placeholder="Se activa"
        value={searchParams.get('trigger')}
        options={TRIGGER_OPTIONS}
        onChange={(value) => setParam('trigger', value)}
      />
      <FilterCombobox
        searchable
        label="Filtrar por pipeline origen"
        placeholder="Pipeline origen"
        value={searchParams.get('fromPipelineId')}
        options={pipelineOptions}
        onChange={(value) => setParam('fromPipelineId', value)}
      />
      <FilterCombobox
        searchable
        label="Filtrar por pipeline destino"
        placeholder="Pipeline destino"
        value={searchParams.get('toPipelineId')}
        options={pipelineOptions}
        onChange={(value) => setParam('toPipelineId', value)}
      />
    </div>
  );
};

export default Filters;
