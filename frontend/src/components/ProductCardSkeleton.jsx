import React from 'react';

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-4 skeleton w-3/4 rounded" />
        <div className="h-4 skeleton w-1/2 rounded" />
        <div className="flex justify-between items-center mt-2">
          <div className="h-6 skeleton w-16 rounded" />
          <div className="h-8 w-8 skeleton rounded-lg" />
        </div>
      </div>
    </div>
  );
}