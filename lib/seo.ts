/**
 * SEO Utility Functions
 * Based on best practices from leading beauty booking platforms
 */

/**
 * Generate meta title with proper length
 * Target: 50-60 characters for optimal display
 */
export function generateMetaTitle(title: string, siteName = 'BeautyBook'): string {
  const maxLength = 60;
  const withSite = `${title} | ${siteName}`;

  if (withSite.length <= maxLength) {
    return withSite;
  }

  // If too long, return without site name
  return title.substring(0, maxLength);
}

/**
 * Generate meta description with proper length
 * Target: 150-160 characters for optimal display
 */
export function generateMetaDescription(description: string): string {
  const maxLength = 160;

  if (description.length <= maxLength) {
    return description;
  }

  return description.substring(0, maxLength - 3) + '...';
}

/**
 * Generate keywords from various sources
 */
export function generateKeywords(
  baseKeywords: string[],
  businessName?: string,
  location?: { city: string; state: string },
  services?: string[]
): string[] {
  const keywords = [...baseKeywords];

  if (businessName) {
    keywords.push(businessName);
  }

  if (location) {
    keywords.push(
      `${location.city}`,
      `${location.state}`,
      `${location.city} ${location.state}`,
      `beauty ${location.city}`,
      `salon ${location.city}`
    );
  }

  if (services && services.length > 0) {
    keywords.push(...services);
    // Add service + location combinations
    if (location) {
      services.forEach(service => {
        keywords.push(`${service} ${location.city}`);
      });
    }
  }

  return Array.from(new Set(keywords)); // Remove duplicates
}

/**
 * Convert minutes to ISO 8601 duration format
 * Used for Schema.org duration fields
 */
export function minutesToISO8601(minutes: number): string {
  if (minutes < 60) {
    return `PT${minutes}M`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `PT${hours}H`;
  }

  return `PT${hours}H${remainingMinutes}M`;
}

/**
 * Generate canonical URL
 */
export function getCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}${path}`;
}

/**
 * Generate Open Graph image URL
 */
export function getOGImageUrl(imagePath?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return imagePath ? `${baseUrl}${imagePath}` : `${baseUrl}/og-image.png`;
}

/**
 * Format price range for Schema.org
 */
export function formatPriceRange(min: number, max: number): string {
  if (max - min < 50) {
    return '$';
  } else if (max - min < 100) {
    return '$$';
  } else if (max - min < 200) {
    return '$$$';
  }
  return '$$$$';
}

/**
 * Generate structured data for FAQ
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate structured data for Review
 */
export function generateReviewSchema(review: {
  author: string;
  rating: number;
  reviewBody: string;
  datePublished: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.reviewBody,
    datePublished: review.datePublished,
  };
}
