import { LOCAL, linkWhatsApp } from '@/lib/config';

const REDES = [
  { nombre: 'Facebook', url: LOCAL.facebook },
  { nombre: 'Instagram', url: LOCAL.instagram },
  { nombre: 'WhatsApp', url: linkWhatsApp() },
];

export function PieDePagina() {
  return (
    <footer className="no-imprimir mt-12 border-t border-carbon-700/70 bg-carbon-950/60">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1 text-sm text-carbon-200">
            <p className="font-semibold text-white">{LOCAL.nombre}</p>
            <p>{LOCAL.direccion}</p>
            <p>
              <a className="hover:text-white" href={`tel:${LOCAL.telefono.replace(/\s/g, '')}`}>
                {LOCAL.telefono}
              </a>
            </p>
            <p>
              <a className="hover:text-white" href={`mailto:${LOCAL.email}`}>
                {LOCAL.email}
              </a>
            </p>
          </div>

          <nav aria-label="Redes sociales" className="flex flex-wrap gap-2">
            {REDES.map((red) => (
              <a
                key={red.nombre}
                href={red.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-carbon-600 px-3 py-2 text-xs font-semibold text-carbon-200 transition hover:border-marca-azul hover:text-white"
              >
                {red.nombre}
              </a>
            ))}
          </nav>
        </div>

        <p className="mt-8 text-xs text-carbon-400">
          &copy; {new Date().getFullYear()} {LOCAL.nombre}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
