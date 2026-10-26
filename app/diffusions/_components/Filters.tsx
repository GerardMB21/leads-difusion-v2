'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import FilterCombobox from '@/components/FilterCombobox';
import { DIFFUSION_STATUSES, parseStatus } from '../schemas';

const STATUS_OPTIONS = DIFFUSION_STATUSES.map(({ value, label }) => ({ value, label }));

const Filters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set(key, value);
    else params.delete(key);

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <FilterCombobox
      label="Filtrar por estado"
      placeholder="Estado"
      clearable={false}
      value={parseStatus(searchParams.get('status'))}
      options={STATUS_OPTIONS}
      onChange={(value) => value && setParam('status', value)}
    />
  );
};

export default Filters;
