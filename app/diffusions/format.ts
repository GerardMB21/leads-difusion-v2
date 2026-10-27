const TIME_ZONE = 'America/Lima';

export const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleString('es-PE', {
        timeZone: TIME_ZONE,
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : '-';
