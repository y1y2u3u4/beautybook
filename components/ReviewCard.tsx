import { Star, ThumbsUp, CheckCircle } from 'lucide-react';
import { Review } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="py-6 border-b border-neutral-200 last:border-0">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-semibold text-lg">
              {review.userName.charAt(0)}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-900">{review.userName}</span>
              {review.verified && (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Verified</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? 'fill-primary-600 text-primary-600'
                        : 'text-neutral-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-neutral-500">
                {formatDate(review.date)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-neutral-700 leading-relaxed">{review.comment}</p>

      <div className="flex items-center gap-4 mt-4">
        <button className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600 transition-colors">
          <ThumbsUp className="w-4 h-4" />
          <span>Helpful ({review.helpful})</span>
        </button>
      </div>
    </div>
  );
}
