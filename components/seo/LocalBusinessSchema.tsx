import React from 'react';

interface LocalBusinessSchemaProps {
  name: string;
  description: string;
  url: string;
  telephone?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  openingHours?: string[];
  priceRange?: string;
  rating?: {
    ratingValue: number;
    reviewCount: number;
  };
  image?: string;
}

export default function LocalBusinessSchema({
  name,
  description,
  url,
  telephone,
  address,
  geo,
  openingHours,
  priceRange,
  rating,
  image,
}: LocalBusinessSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name,
    description,
    url,
    ...(telephone && { telephone }),
    ...(image && { image }),
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        ...address,
      },
    }),
    ...(geo && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: geo.latitude,
        longitude: geo.longitude,
      },
    }),
    ...(openingHours && { openingHours }),
    ...(priceRange && { priceRange }),
    ...(rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.ratingValue,
        reviewCount: rating.reviewCount,
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
