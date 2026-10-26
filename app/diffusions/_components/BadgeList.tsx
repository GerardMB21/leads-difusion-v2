import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const MAX_VISIBLE = 2;
const MAX_EXTRA_LABEL = 9;

interface Props {
  label: string;
  items: { id: number; name: string }[];
  variant?: 'outline' | 'secondary';
}

const BadgeList = ({ label, items, variant = 'outline' }: Props) => {
  const visible = items.slice(0, MAX_VISIBLE);
  const extra = items.slice(MAX_VISIBLE);

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 shrink-0 text-muted-foreground">{label}</span>
      {items.length === 0 ? (
        '-'
      ) : (
        <div className="flex min-w-0 items-center gap-2">
          {visible.map((item) => (
            <Badge key={item.id} variant={variant} className="truncate text-start">
              {item.name}
            </Badge>
          ))}
          {extra.length > 0 && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Badge variant={variant} className="rounded-full">
                    +{Math.min(extra.length, MAX_EXTRA_LABEL)}
                  </Badge>
                }
              />
              <TooltipContent>
                <ul className="flex flex-col gap-2">
                  {extra.map((item) => (
                    <li key={item.id}>{item.name}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
};

export default BadgeList;
