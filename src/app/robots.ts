import type { MetadataRoute } from 'next';

import { urlDelSitio } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // El area del local y las paginas de cada cliente no van a buscadores.
      disallow: ['/admin', '/patente/'],
    },
    sitemap: `${urlDelSitio()}/sitemap.xml`,
  };
}
