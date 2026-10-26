import sanitizeHtml from 'sanitize-html';

// Only what the template editor can produce; everything else (scripts, attributes, links) is dropped.
export function sanitizeMessage(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'strong', 'em', 's', 'ul', 'ol', 'li'],
    allowedAttributes: {},
  });
}
