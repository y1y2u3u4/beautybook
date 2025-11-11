'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">Favorite Providers</h1>

      <div className="card p-12 text-center">
        <Heart className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-neutral-700 mb-2">No favorites yet</h3>
        <p className="text-neutral-500 mb-6">
          Start saving your favorite providers to quickly book with them again
        </p>
        <Link href="/providers" className="btn-primary inline-block">
          Explore Providers
        </Link>
      </div>
    </div>
  );
}
