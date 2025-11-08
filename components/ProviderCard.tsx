import Link from 'next/link';
import { Star, MapPin, Clock, Shield, CheckCircle } from 'lucide-react';
import { Provider } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

interface ProviderCardProps {
  provider: Provider;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  const getNextAvailableText = () => {
    if (!provider.nextAvailable) return 'View availability';

    const now = new Date();
    const diff = provider.nextAvailable.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) return 'Available today';
    if (hours < 48) return 'Available tomorrow';
    return `Next: ${provider.nextAvailable.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  return (
    <div className="group card-glass hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-primary-200">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="relative w-32 h-32 rounded-3xl overflow-hidden bg-gradient-to-br from-primary-100 to-secondary-100 ring-4 ring-white group-hover:ring-primary-200 transition-all">
            <Image
              src={provider.avatar}
              alt={provider.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
            {provider.verified && (
              <div className="absolute bottom-2 right-2 bg-gradient-to-br from-primary-500 to-secondary-500 text-white p-2 rounded-xl shadow-lg">
                <Shield className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link href={`/providers/${provider.id}`} className="group">
                <h3 className="text-xl font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                  {provider.name}
                </h3>
              </Link>
              <p className="text-neutral-600 mt-1">{provider.title}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1 bg-gradient-to-r from-primary-50 to-secondary-50 px-4 py-2 rounded-2xl border border-primary-200 shadow-sm">
                <Star className="w-5 h-5 fill-primary-600 text-primary-600" />
                <span className="font-bold text-lg gradient-text">{provider.rating}</span>
              </div>
              <span className="text-sm text-neutral-600 font-medium">({provider.reviewCount})</span>
            </div>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-2 mt-4">
            {provider.specialty.slice(0, 3).map((spec) => (
              <span key={spec} className="badge badge-info group-hover:bg-primary-100 transition-colors">
                {spec}
              </span>
            ))}
          </div>

          {/* Info */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-neutral-600">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{provider.location.city}, {provider.location.state}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{provider.experience} years experience</span>
            </div>
            {provider.verified && (
              <div className="flex items-center gap-1.5 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Verified</span>
              </div>
            )}
          </div>

          {/* Bio */}
          <p className="text-neutral-600 mt-3 line-clamp-2">
            {provider.bio}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-neutral-200/50">
            <div>
              <p className="text-sm text-neutral-500 mb-1">Starting from</p>
              <p className="text-2xl font-bold gradient-text">
                {formatCurrency(provider.priceRange.min)}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-neutral-500 mb-1">Next Available</p>
                <p className="text-sm font-semibold text-primary-600">{getNextAvailableText()}</p>
              </div>
              <Link
                href={`/providers/${provider.id}/book`}
                className="btn-primary px-8 py-2.5 text-sm shadow-lg group-hover:shadow-glow transition-all"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
