import { Bloque, EncabezadoDeCarga } from '@/components/Esqueleto';

export default function Cargando() {
  return (
    <div className="space-y-6">
      <EncabezadoDeCarga
        titulo="Preparando el ticket"
        detalle="Buscando el ultimo servicio y generando el codigo QR."
      />
      <Bloque className="mx-auto h-[150mm] w-[80mm] max-w-full rounded" />
    </div>
  );
}
