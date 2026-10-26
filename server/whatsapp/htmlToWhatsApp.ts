import TurndownService from 'turndown';

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
  strongDelimiter: '**',
});

turndown.addRule('strikethrough', {
  filter: ['del', 's'],
  replacement: (content) => `~~${content}~~`,
});

/** Converts the template editor's HTML into WhatsApp formatting (*bold*, _italic_, ~strike~). */
export function htmlToWhatsApp(html: string) {
  return turndown
    .turndown(html)
    .replace(/^[ \t]+$/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '*$1*')
    .replace(/~~(.*?)~~/g, '~$1~')
    .replace(/`([^`]+)`/g, '```$1```')
    .replace(/^#+\s*/gm, '')
    .replace(/^\s*-\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
