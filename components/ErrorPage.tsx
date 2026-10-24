import type { NormalizedError } from '@/lib/types';

type Props = {
  error: NormalizedError;
};

const ErrorPage = ({ error }: Props) => {
  return (
    <div className="h-full">
      <div className="flex h-full flex-col items-center justify-center">
        <div className="mt-10 text-center">
          <h3 className="mb-2">Perdón tenemos problemas!</h3>
          <p className="text-base">
            {error.message ?? 'Error de respuesta en la pagina, contacta con el area de soporte'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
