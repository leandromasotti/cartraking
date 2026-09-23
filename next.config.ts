import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // En Windows, `next dev` mantiene tomado .next y un `next build` en paralelo
  // falla con EPERM. Con NEXT_DIST_DIR el build escribe en otra carpeta y los
  // dos pueden convivir. Vercel nunca define esa variable, asi que en
  // produccion se sigue usando .next como siempre.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // El proyecto .NET original vive en legacy/ solo como referencia historica.
  outputFileTracingExcludes: { '*': ['./legacy/**'] },
};

export default nextConfig;
