'use client';

import {
  IconBold,
  IconItalic,
  IconList,
  IconListNumbers,
  IconStrikethrough,
} from '@tabler/icons-react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { Button } from '@/components/ui/button';
import { RICH_TEXT_STYLES } from '@/components/RichTextContent';
import { cn } from '@/lib/utils';

interface Props {
  id?: string;
  value: string;
  invalid?: boolean;
  onChange: (html: string) => void;
}

const RichTextEditor = ({ id, value, invalid, onChange }: Props) => {
  const editor = useEditor({
    immediatelyRender: false,
    content: value,
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        link: false,
        underline: false,
      }),
    ],
    editorProps: {
      attributes: {
        id: id ?? '',
        class: cn('max-h-64 min-h-32 overflow-y-auto px-2.5 py-2 outline-none', RICH_TEXT_STYLES),
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  });

  const active = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive('bold') ?? false,
      italic: current?.isActive('italic') ?? false,
      strike: current?.isActive('strike') ?? false,
      bulletList: current?.isActive('bulletList') ?? false,
      orderedList: current?.isActive('orderedList') ?? false,
    }),
  });

  if (!editor || !active) return null;

  const tools = [
    {
      label: 'Negrita',
      icon: IconBold,
      on: active.bold,
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: 'Cursiva',
      icon: IconItalic,
      on: active.italic,
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: 'Tachado',
      icon: IconStrikethrough,
      on: active.strike,
      run: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      label: 'Lista',
      icon: IconList,
      on: active.bulletList,
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: 'Lista numerada',
      icon: IconListNumbers,
      on: active.orderedList,
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
  ];

  return (
    <div
      aria-invalid={invalid}
      className={cn(
        'rounded-lg border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30',
        invalid && 'border-destructive',
      )}
    >
      <div className="flex items-center gap-1 border-b p-1">
        {tools.map(({ label, icon: Icon, on, run }) => (
          <Button
            key={label}
            type="button"
            variant={on ? 'secondary' : 'ghost'}
            size="icon-sm"
            aria-label={label}
            aria-pressed={on}
            onClick={run}
          >
            <Icon />
          </Button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
