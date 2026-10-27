'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import FilterCombobox from '@/components/FilterCombobox';
import MultiCombobox from '@/components/MultiCombobox';
import { Input } from '@/components/ui/input';
import { useStore } from '../_store';

const SEARCH_DEBOUNCE = 300;

const Filters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { pipelines, tags } = useStore((state) => state);

  const urlSearch = searchParams.get('search') ?? '';
  const [search, setSearch] = useState(urlSearch);

  const tagIds = (searchParams.get('tagIds') ?? '').split(',').filter(Boolean).map(Number);

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set(key, value);
    else params.delete(key);

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  useEffect(() => {
    if (search.trim() === urlSearch) return;

    const timeout = setTimeout(() => setParam('search', search.trim()), SEARCH_DEBOUNCE);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="flex flex-wrap items-start gap-2">
      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar por nombre o teléfono"
        aria-label="Buscar por nombre o teléfono"
        className="w-full sm:w-72"
      />
      <FilterCombobox
        searchable
        label="Filtrar por pipeline"
        placeholder="Pipeline"
        value={searchParams.get('pipelineId')}
        options={pipelines.map(({ id, name }) => ({ value: String(id), label: name }))}
        onChange={(value) => setParam('pipelineId', value)}
      />
      <div className="w-full sm:w-72">
        <MultiCombobox
          id="leads-filter-tags"
          value={tagIds}
          options={tags}
          placeholder="Etiquetas (todas)"
          emptyText="Sin etiquetas"
          onChange={(ids) => setParam('tagIds', ids.join(','))}
        />
      </div>
    </div>
  );
};

export default Filters;
