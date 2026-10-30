import { cn } from '@/lib/utils';

export const RICH_TEXT_STYLES =
  '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:min-h-[1lh] [&_strong]:font-semibold [&_em]:italic [&_s]:line-through';

interface Props {
  html: string;
  className?: string;
}

const RichTextContent = ({ html, className }: Props) => (
  <div className={cn(RICH_TEXT_STYLES, className)} dangerouslySetInnerHTML={{ __html: html }} />
);

export default RichTextContent;
