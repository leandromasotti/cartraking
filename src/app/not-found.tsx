import Link from 'next/link';

export default function NoEncontrado() {
  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <p className="text-6xl font-black text-carbon-700">404</p>
      <h1 className="mt-4 text-2xl font-bold">No encontramos esta pagina</h1>
      <p className="mt-2 text-sm text-carbon-200">
        Puede que el link este mal escrito o que ya no exista.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-xl bg-marca-rojo px-5 py-3 text-sm font-bold transition hover:bg-marca-rojo-claro"
      >
        Ir al inicio
      </Link>
    </div>
  );
}
