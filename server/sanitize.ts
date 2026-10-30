import sanitizeHtml from 'sanitize-html';

export function sanitizeMessage(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'strong', 'em', 's', 'ul', 'ol', 'li'],
    allowedAttributes: {},
  });
}
