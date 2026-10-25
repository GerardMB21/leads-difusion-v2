'use client';

import type { Ref } from 'react';
import type { CommonProps } from '@/lib/types';
import type { Lead } from '../types';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const MAX_VISIBLE_TAGS = 2;

interface Props extends CommonProps {
  lead: Lead;
  ref?: Ref<HTMLDivElement>;
}

const LeadCard = ({ lead, className, ref, ...rest }: Props) => {
  const { contactName, phone, enrollmentDate, tags } = lead;
  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col gap-2 rounded-lg border bg-card p-3 text-card-foreground shadow-sm',
        className,
      )}
      {...rest}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium">{contactName}</span>
        <Badge className="shrink-0">
          {new Date(enrollmentDate).toLocaleDateString('es', { dateStyle: 'medium' })}
        </Badge>
      </div>
      <p className="text-base font-semibold">{phone}</p>
      {tags.length > 0 && (
        <div className="flex min-w-0 items-center justify-start gap-1 overflow-hidden">
          {visibleTags.map((tag) => (
            <Badge key={tag.id} variant="outline" className="min-w-0 truncate">
              {tag.name}
            </Badge>
          ))}
          {tags.length > MAX_VISIBLE_TAGS && (
            <Badge variant="outline" className="shrink-0 rounded-full">
              {MAX_VISIBLE_TAGS + 1}+
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default LeadCard;
