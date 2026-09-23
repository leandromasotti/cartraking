import Image from 'next/image';
import Link from 'next/link';

import { LOCAL } from '@/lib/config';

export function Encabezado() {
  return (
    <header className="no-imprimir sticky top-0 z-20 border-b border-carbon-700/70 bg-carbon-950/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image
            src="/logo.png"
            alt=""
            width={40}
            height={40}
            className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
            priority
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold tracking-wide sm:text-base">
              {LOCAL.nombre}
            </span>
            <span className="hidden text-xs text-carbon-400 sm:block">{LOCAL.descripcion}</span>
          </span>
        </Link>

        <a
          href={`tel:${LOCAL.telefono.replace(/\s/g, '')}`}
          className="ml-auto shrink-0 rounded-lg border border-carbon-600 px-3 py-2 text-xs font-semibold text-carbon-200 transition hover:border-marca-azul hover:text-white sm:text-sm"
        >
          {LOCAL.telefono}
        </a>
      </div>
    </header>
  );
}
