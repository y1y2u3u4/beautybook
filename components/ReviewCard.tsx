'use client';

import React, { useMemo, useCallback, useState } from 'react';
import { Star, ThumbsUp, CheckCircle } from 'lucide-react';
import { Review } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface ReviewCardProps {
  review: Review;
  onHelpfulClick?: (reviewId: string) => void;
}

/**
 * Review card component with performance optimizations
 * Uses React.memo to prevent unnecessary re-renders
 */
const ReviewCard = React.memo(function ReviewCard({ review, onHelpfulClick }: ReviewCardProps) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpful);
  const [hasVoted, setHasVoted] = useState(false);

  // Memoize the formatted date
  const formattedDate = useMemo(
    () => formatDate(review.date),
    [review.date]
  );

  // Memoize the star rating display
  const starDisplay = useMemo(() => (
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
  ), [review.rating]);

  // Memoize the user initial
  const userInitial = useMemo(
    () => review.userName.charAt(0).toUpperCase(),
    [review.userName]
  );

  // Handle helpful click
  const handleHelpfulClick = useCallback(() => {
    if (hasVoted) return;

    setHelpfulCount(prev => prev + 1);
    setHasVoted(true);

    if (onHelpfulClick) {
      onHelpfulClick(review.id);
    }
  }, [hasVoted, onHelpfulClick, review.id]);

  return (
    <div className="py-6 border-b border-neutral-200 last:border-0">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-semibold text-lg">
              {userInitial}
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
              {starDisplay}
              <span className="text-sm text-neutral-500">
                {formattedDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-neutral-700 leading-relaxed">{review.comment}</p>

      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={handleHelpfulClick}
          disabled={hasVoted}
          className={`flex items-center gap-2 text-sm transition-colors ${
            hasVoted
              ? 'text-primary-600 cursor-default'
              : 'text-neutral-600 hover:text-primary-600'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-primary-600' : ''}`} />
          <span>Helpful ({helpfulCount})</span>
        </button>
      </div>
    </div>
  );
});

export default ReviewCard;
