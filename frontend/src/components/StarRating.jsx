import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, interactive = false, size = 'sm', onRate = () => {} }) {
  const [hover, setHover] = useState(0);
  const sizes = { xs: 'w-3 h-3', sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
  const sizeClass = sizes[size] || sizes.sm;
  const display = hover || rating;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`${interactive ? 'cursor-pointer' : 'cursor-default'} transition-transform ${interactive && hover === star ? 'scale-110' : ''}`}
        >
          <Star className={`${sizeClass} ${display >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );
}