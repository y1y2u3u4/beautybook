# BeautyBook SEO Implementation

## Overview

BeautyBook's SEO implementation is based on best practices from leading beauty booking platforms including Booksy, Mindbody, and Vagaro. This document outlines all SEO features and how to configure them.

---

## 🎯 Key Features

### 1. **Schema.org Structured Data**
- **LocalBusiness/BeautySalon Schema**: Helps appear in local searches and "near me" queries
- **Service Schema**: Individual service pages with pricing and duration
- **Breadcrumb Schema**: Navigation hierarchy for search engines
- **FAQ Schema**: Frequently asked questions (utility available)
- **Review Schema**: Customer reviews (utility available)

### 2. **Meta Tags & Social Sharing**
- Optimized meta titles (50-60 characters)
- Meta descriptions (150-160 characters)
- Open Graph tags for Facebook/LinkedIn
- Twitter Card tags for Twitter
- Canonical URLs to prevent duplicate content

### 3. **Search Engine Directives**
- Sitemap for all public routes
- Robots.txt configuration
- Google Search Console verification support
- Mobile-optimized viewport

### 4. **Dynamic Metadata**
- Provider-specific booking pages with location-based SEO
- Service-specific metadata
- Automatic keyword generation

---

## 📁 File Structure

```
app/
├── layout.tsx                 # Root layout with global SEO
├── sitemap.ts                 # XML sitemap generation
├── robots.ts                  # Robots.txt configuration
└── book/
    └── [providerSlug]/
        └── layout.tsx         # Dynamic provider SEO

components/
└── seo/
    ├── LocalBusinessSchema.tsx    # LocalBusiness/BeautySalon schema
    ├── ServiceSchema.tsx          # Service offering schema
    └── BreadcrumbSchema.tsx       # Navigation breadcrumb

lib/
└── seo.ts                     # SEO utility functions
```

---

## ⚙️ Configuration

### Required Environment Variables

Add these to your `.env` file:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME=BeautyBook

# SEO & Verification
GOOGLE_SITE_VERIFICATION=your_verification_code_here

# Optional Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Social Media Images

Create the following images and place them in the `public/` directory:

- **og-image.png**: 1200x630px (Open Graph default image)
- **twitter-image.png**: 1200x675px (Twitter Card image)
- **favicon.ico**: 16x16px, 32x32px (Browser favicon)
- **apple-touch-icon.png**: 180x180px (iOS home screen icon)

**Recommended specs:**
- Format: PNG or JPG
- File size: < 1MB
- Include your logo and brand colors
- Ensure text is readable at small sizes

---

## 🔍 Schema.org Implementation

### LocalBusiness Schema

Used on provider booking pages to help with local SEO:

```tsx
<LocalBusinessSchema
  name="Provider Business Name"
  description="Brief business description"
  url="https://yourdomain.com/book/provider-slug"
  telephone="+1234567890"
  address={{
    street: "123 Main St",
    city: "City",
    state: "State",
    postalCode: "12345",
    country: "US"
  }}
  geo={{
    latitude: 40.7128,
    longitude: -74.0060
  }}
  openingHours={[
    "Mo-Fr 09:00-18:00",
    "Sa 10:00-16:00"
  ]}
  priceRange="$$"
  rating={4.8}
  reviewCount={127}
/>
```

### Service Schema

Used for individual services:

```tsx
<ServiceSchema
  services={[
    {
      name: "Hydrating Facial",
      description: "Deep hydration treatment...",
      price: 85,
      duration: 60,
      url: "https://yourdomain.com/book/provider-slug"
    }
  ]}
  provider={{
    name: "Provider Business Name",
    url: "https://yourdomain.com/book/provider-slug"
  }}
/>
```

### Breadcrumb Schema

Used for navigation hierarchy:

```tsx
<BreadcrumbSchema
  items={[
    { name: "Home", url: "https://yourdomain.com" },
    { name: "Providers", url: "https://yourdomain.com/providers" },
    { name: "Provider Name", url: "https://yourdomain.com/book/provider-slug" }
  ]}
/>
```

---

## 📝 SEO Utility Functions

### Generate Meta Title
```typescript
import { generateMetaTitle } from '@/lib/seo';

const title = generateMetaTitle('Book Appointment', 'BeautyBook');
// Returns: "Book Appointment | BeautyBook" (max 60 chars)
```

### Generate Meta Description
```typescript
import { generateMetaDescription } from '@/lib/seo';

const description = generateMetaDescription('Long description text...');
// Returns: Truncated to 160 characters with ellipsis
```

### Generate Keywords
```typescript
import { generateKeywords } from '@/lib/seo';

const keywords = generateKeywords(
  ['beauty', 'salon', 'spa'],
  'Glow Beauty Salon',
  { city: 'New York', state: 'NY' },
  ['facial', 'massage', 'manicure']
);
// Returns: Array of unique, relevant keywords
```

### Convert Duration to ISO 8601
```typescript
import { minutesToISO8601 } from '@/lib/seo';

const duration = minutesToISO8601(90);
// Returns: "PT1H30M" (ISO 8601 format for Schema.org)
```

### Format Price Range
```typescript
import { formatPriceRange } from '@/lib/seo';

const priceRange = formatPriceRange(50, 200);
// Returns: "$$$" (based on price difference)
```

---

## 🚀 Implementation Examples

### Provider Booking Page

The `/app/book/[providerSlug]/layout.tsx` implements comprehensive SEO:

**Features:**
- Dynamic metadata based on provider data
- LocalBusiness schema with ratings and location
- Service schema for all offerings
- Breadcrumb navigation
- Open Graph and Twitter cards
- Location-based keywords

**Example metadata generated:**
```
Title: "Book Glow Beauty Salon - New York, NY | BeautyBook"
Description: "Book appointments with Glow Beauty Salon in New York, NY.
              Offering Facial, Massage, Manicure, and more. Rated 4.8/5
              stars from 127 reviews."
Keywords: beauty, salon, booking, New York, NY, facial New York,
          massage New York...
```

### Home Page SEO

The `/app/layout.tsx` includes global SEO configuration:

**Features:**
- Site-wide default metadata
- Global Open Graph defaults
- Twitter Card configuration
- Mobile viewport optimization
- Search engine verification
- Icon and manifest configuration

---

## 📊 Sitemap

The sitemap is automatically generated at `/sitemap.xml` and includes:

- Static pages (home, providers list, etc.)
- Dynamic provider booking pages
- Customer and provider dashboard pages (with lower priority)
- Last modified dates
- Change frequency hints

**Access:** `https://yourdomain.com/sitemap.xml`

---

## 🤖 Robots.txt

The robots.txt configuration:

**Allowed:**
- Public pages (`/`)
- Provider listings (`/providers`)
- Booking pages (`/book/*`)

**Disallowed:**
- Provider dashboard (`/provider/*`)
- Customer dashboard (`/customer/*`)
- API routes (`/api/*`)
- Admin routes (`/admin/*`)

**Access:** `https://yourdomain.com/robots.txt`

---

## 📈 SEO Best Practices

### Local SEO
1. ✅ Include city and state in page titles
2. ✅ Use LocalBusiness schema on all provider pages
3. ✅ Add geo-coordinates for map results
4. ✅ Include business hours in schema
5. ✅ Display ratings and review count

### On-Page SEO
1. ✅ Unique titles for each page (50-60 chars)
2. ✅ Unique descriptions (150-160 chars)
3. ✅ Proper heading hierarchy (H1 → H2 → H3)
4. ✅ Alt text for images
5. ✅ Mobile-responsive design

### Technical SEO
1. ✅ XML sitemap submission to Google Search Console
2. ✅ Robots.txt optimization
3. ✅ Canonical URLs to prevent duplicates
4. ✅ Structured data (Schema.org)
5. ✅ Fast page load times (Next.js optimization)

### Social SEO
1. ✅ Open Graph tags for Facebook/LinkedIn
2. ✅ Twitter Card tags
3. ✅ High-quality social share images (1200x630)
4. ✅ Descriptive meta descriptions

---

## 🔧 Maintenance

### Regular Updates

**Monthly:**
- Review and update meta descriptions
- Check for broken links in sitemap
- Update social media images seasonally

**Quarterly:**
- Audit keyword performance
- Update FAQs based on customer questions
- Review and improve page load speeds

**Annually:**
- Major content refresh
- Competitor SEO analysis
- Schema.org specification updates

### Google Search Console Setup

1. **Verify ownership:**
   - Add `GOOGLE_SITE_VERIFICATION` to `.env`
   - Deploy and verify in Google Search Console

2. **Submit sitemap:**
   - Go to Search Console → Sitemaps
   - Submit: `https://yourdomain.com/sitemap.xml`

3. **Monitor performance:**
   - Track impressions, clicks, CTR
   - Identify and fix crawl errors
   - Review search queries and rankings

---

## 📱 Mobile SEO

All pages are mobile-optimized with:
- Responsive viewport meta tag
- Mobile-friendly navigation
- Touch-friendly buttons (44x44px minimum)
- Fast mobile page loads
- Mobile-specific structured data

---

## 🎨 Rich Snippets

With proper implementation, your pages can show:

- ⭐ **Star ratings** in search results
- 💰 **Price ranges** for services
- 📍 **Location and map** in local pack
- 📞 **Phone number** click-to-call
- ⏰ **Business hours** display
- 🔍 **Breadcrumb navigation** in results

---

## 🆘 Troubleshooting

### Schema.org Validation

Test your structured data:
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

### Common Issues

**Issue:** Structured data not showing
- **Solution:** Wait 2-4 weeks for Google to index changes
- **Check:** Use Rich Results Test tool

**Issue:** Wrong meta tags on social media
- **Solution:** Use social media debuggers to refresh cache
  - [Facebook Debugger](https://developers.facebook.com/tools/debug/)
  - [Twitter Card Validator](https://cards-dev.twitter.com/validator)

**Issue:** Sitemap errors
- **Solution:** Check Google Search Console → Coverage report
- **Fix:** Ensure all URLs are accessible and return 200 status

---

## 📚 Resources

- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Schema.org Documentation](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

---

## ✅ SEO Checklist

Use this checklist when launching:

- [ ] Set `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Add `GOOGLE_SITE_VERIFICATION` code
- [ ] Create and upload social media images
- [ ] Verify sitemap.xml is accessible
- [ ] Verify robots.txt is accessible
- [ ] Test structured data with Rich Results Test
- [ ] Submit sitemap to Google Search Console
- [ ] Test social media cards (Facebook, Twitter, LinkedIn)
- [ ] Enable Google Analytics (optional)
- [ ] Set up Bing Webmaster Tools (optional)
- [ ] Monitor page speed with PageSpeed Insights
- [ ] Set up Google Business Profile for local SEO

---

**Last Updated:** 2025-11-16
**Version:** 1.0.0
