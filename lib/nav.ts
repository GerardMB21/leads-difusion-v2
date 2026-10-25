import { IconAutomation, IconPipeline, IconTemplate, IconUsersGroup } from '@tabler/icons-react';

export const navMain = [
  { title: 'Pipelines', url: '/pipelines', icon: IconPipeline },
  { title: 'Leads', url: '/leads', icon: IconUsersGroup },
  { title: 'Templates', url: '/templates', icon: IconTemplate },
  { title: 'Workflows', url: '/workflows', icon: IconAutomation },
];

export function getSectionTitle(pathname: string) {
  const match = navMain
    .filter((item) => pathname === item.url || pathname.startsWith(`${item.url}/`))
    .sort((a, b) => b.url.length - a.url.length)[0];

  return match?.title;
}
