import type { Template } from '../types';

import RichTextContent from '@/components/RichTextContent';
import TemplateActions from './TemplateActions';

const TemplateCard = ({ template }: { template: Template }) => (
  <article className="flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground">
    <header className="flex items-center justify-between gap-2">
      <h3 className="truncate font-medium">{template.name}</h3>
      <TemplateActions template={template} />
    </header>
    {template.img && (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={template.img}
        alt={template.name}
        loading="lazy"
        className="h-32 w-full rounded-md object-cover"
      />
    )}
    <RichTextContent html={template.message} className="line-clamp-5 text-sm" />
  </article>
);

export default TemplateCard;
