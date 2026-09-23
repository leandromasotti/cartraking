import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // El proyecto .NET original vive en legacy/ solo como referencia historica.
  outputFileTracingExcludes: { '*': ['./legacy/**'] },
};

export default nextConfig;
