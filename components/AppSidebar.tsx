'use client';

import * as React from 'react';
import { NavMain } from '@/components/NavMain';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { navMain } from '@/lib/nav';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
    </Sidebar>
  );
}
