const DEFAULT_COUNTRY_CODE = '51';
const LOCAL_NUMBER_LENGTH = 9;

export function phoneCandidates(phone: string) {
  const digits = phone.replace(/\D/g, '').replace(/^00/, '');

  if (!digits) return [];

  const international =
    digits.length === LOCAL_NUMBER_LENGTH ? `${DEFAULT_COUNTRY_CODE}${digits}` : digits;
  const local =
    international.startsWith(DEFAULT_COUNTRY_CODE) &&
    international.length === DEFAULT_COUNTRY_CODE.length + LOCAL_NUMBER_LENGTH
      ? international.slice(DEFAULT_COUNTRY_CODE.length)
      : null;

  return [...new Set([international, `+${international}`, ...(local ? [local] : [])])];
}
