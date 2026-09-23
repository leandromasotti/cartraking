import type { MetadataRoute } from 'next';

import { urlDelSitio } from '@/lib/config';

/** Solo el inicio: el resto del sitio son datos de clientes o del local. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: urlDelSitio(), lastModified: new Date(), changeFrequency: 'monthly', priority: 1 }];
}
