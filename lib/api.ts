import axios from 'axios';

import type { NormalizedError } from '@/lib/types';

export const api = axios.create({
  baseURL: '/api',
  timeout: 5_000,
});

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<NormalizedError>(error)) {
    if (error.code === 'ECONNABORTED') return 'La solicitud tardó demasiado, intenta de nuevo';

    return error.response?.data?.message ?? fallback;
  }

  return fallback;
}
