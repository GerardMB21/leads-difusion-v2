'use client';

import ImportLeadsDialog from '@/components/ImportLeadsDialog';
import CreatePipelineDialog from './CreatePipelineDialog';

const Header = () => (
  <div className="flex items-center justify-end gap-2 px-4 pt-4">
    <ImportLeadsDialog />
    <CreatePipelineDialog />
  </div>
);

export default Header;
