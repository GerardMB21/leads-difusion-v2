'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Input } from '@/components/ui/input';

const SEARCH_DEBOUNCE = 300;

const Filters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get('search') ?? '';
  const [search, setSearch] = useState(urlSearch);

  useEffect(() => {
    if (search.trim() === urlSearch) return;

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (search.trim()) params.set('search', search.trim());
      else params.delete('search');

      const query = params.toString();

      router.replace(query ? `${pathname}?${query}` : pathname);
    }, SEARCH_DEBOUNCE);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <Input
      value={search}
      onChange={(event) => setSearch(event.target.value)}
      placeholder="Buscar por nombre o teléfono"
      aria-label="Buscar por nombre o teléfono"
      className="w-full sm:w-72"
    />
  );
};

export default Filters;
