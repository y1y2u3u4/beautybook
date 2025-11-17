import React from 'react';

interface ServiceSchemaProps {
  name: string;
  description: string;
  provider: {
    name: string;
    url: string;
  };
  serviceType: string;
  areaServed?: string;
  priceRange?: string;
  duration?: string; // ISO 8601 duration format (e.g., "PT1H" for 1 hour)
  offers?: {
    price: number;
    priceCurrency: string;
  };
}

export default function ServiceSchema({
  name,
  description,
  provider,
  serviceType,
  areaServed,
  priceRange,
  duration,
  offers,
}: ServiceSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: provider.name,
      url: provider.url,
    },
    serviceType,
    ...(areaServed && { areaServed }),
    ...(priceRange && { priceRange }),
    ...(duration && { duration }),
    ...(offers && {
      offers: {
        '@type': 'Offer',
        price: offers.price,
        priceCurrency: offers.priceCurrency,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
