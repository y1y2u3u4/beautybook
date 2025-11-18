import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LocalBusinessSchema from '@/components/seo/LocalBusinessSchema';
import ServiceSchema from '@/components/seo/ServiceSchema';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

interface Props {
  params: { providerSlug: string };
  children: React.ReactNode;
}

async function getProviderData(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/providers/public/${slug}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getProviderData(params.providerSlug);

  if (!data || !data.provider) {
    return {
      title: 'Provider Not Found',
      description: 'The provider you are looking for could not be found.',
    };
  }

  const { provider, services } = data;
  const servicesList = services.map((s: any) => s.name).join(', ');

  return {
    title: `Book ${provider.businessName} - ${provider.city}, ${provider.state}`,
    description: `Book appointments with ${provider.businessName} in ${provider.city}, ${provider.state}. Services: ${servicesList}. Rated ${provider.averageRating}/5 from ${provider.reviewCount} reviews. Schedule online instantly.`,
    keywords: [
      provider.businessName,
      ...services.map((s: any) => s.name),
      provider.city,
      provider.state,
      'beauty booking',
      'salon appointment',
      'online booking',
    ],
    openGraph: {
      title: `Book ${provider.businessName}`,
      description: `${provider.bio.substring(0, 160)}...`,
      type: 'website',
      locale: 'en_US',
      url: `/book/${params.providerSlug}`,
      siteName: 'BeautyBook',
      images: provider.imageUrl
        ? [
            {
              url: provider.imageUrl,
              width: 800,
              height: 600,
              alt: provider.businessName,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Book ${provider.businessName}`,
      description: `${provider.bio.substring(0, 160)}...`,
      images: provider.imageUrl ? [provider.imageUrl] : [],
    },
    alternates: {
      canonical: `/book/${params.providerSlug}`,
    },
  };
}

export default async function BookingLayout({ params, children }: Props) {
  const data = await getProviderData(params.providerSlug);

  if (!data || !data.provider) {
    return <>{children}</>;
  }

  const { provider, services } = data;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Build opening hours array if available
  const openingHours = provider.businessHours
    ? Object.entries(provider.businessHours).map(
        ([day, hours]: [string, any]) =>
          `${day} ${hours.open}-${hours.close}`
      )
    : undefined;

  return (
    <>
      {/* Structured Data */}
      <LocalBusinessSchema
        name={provider.businessName}
        description={provider.bio}
        url={`${baseUrl}/book/${params.providerSlug}`}
        telephone={provider.phone}
        address={{
          streetAddress: provider.address,
          addressLocality: provider.city,
          addressRegion: provider.state,
          postalCode: provider.zipCode,
          addressCountry: 'US',
        }}
        geo={
          provider.latitude && provider.longitude
            ? {
                latitude: provider.latitude,
                longitude: provider.longitude,
              }
            : undefined
        }
        openingHours={openingHours}
        priceRange="$$"
        rating={
          provider.reviewCount > 0
            ? {
                ratingValue: provider.averageRating,
                reviewCount: provider.reviewCount,
              }
            : undefined
        }
        image={provider.imageUrl}
      />

      {/* Service Schema for each service */}
      {services.map((service: any) => (
        <ServiceSchema
          key={service.id}
          name={service.name}
          description={service.description}
          provider={{
            name: provider.businessName,
            url: `${baseUrl}/book/${params.providerSlug}`,
          }}
          serviceType={service.category}
          areaServed={`${provider.city}, ${provider.state}`}
          priceRange={`$${service.price}`}
          duration={`PT${service.duration}M`}
          offers={{
            price: service.price,
            priceCurrency: 'USD',
          }}
        />
      ))}

      {/* Breadcrumb Schema */}
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: baseUrl },
          { name: 'Providers', url: `${baseUrl}/providers` },
          {
            name: provider.businessName,
            url: `${baseUrl}/book/${params.providerSlug}`,
          },
        ]}
      />

      {children}
    </>
  );
}
