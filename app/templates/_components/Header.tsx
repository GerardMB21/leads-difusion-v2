'use client';

import { Input } from '@/components/ui/input';
import { useStore } from '../_store';
import CreateTemplateDialog from './CreateTemplateDialog';

const Header = () => {
  const search = useStore((state) => state.search);
  const setSearch = useStore((state) => state.setSearch);

  return (
    <div className="flex items-center justify-between gap-2">
      <Input
        className="max-w-sm"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar por nombre"
        aria-label="Buscar por nombre"
      />
      <CreateTemplateDialog />
    </div>
  );
};

export default Header;
