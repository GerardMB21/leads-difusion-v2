export function getFile(form: FormData, key: string) {
  const value = form.get(key);

  return value instanceof File && value.size > 0 ? value : null;
}

export function getString(form: FormData, key: string) {
  const value = form.get(key);

  return typeof value === 'string' ? value : undefined;
}
