'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Heart } from 'lucide-react';

interface PortfolioImage {
  id: string;
  url: string;
  thumbnail?: string;
  caption?: string;
}

interface PortfolioGalleryProps {
  images: PortfolioImage[];
  title?: string;
  className?: string;
}

export default function PortfolioGallery({
  images,
  title,
  className = '',
}: PortfolioGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };

  const goToPrevious = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const selectedImage = selectedImageIndex !== null ? images[selectedImageIndex] : null;

  return (
    <>
      <div className={className}>
        {title && (
          <h3 className="text-2xl font-bold text-neutral-900 mb-6">{title}</h3>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => openLightbox(index)}
              className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
            >
              <Image
                src={image.thumbnail || image.url}
                alt={image.caption || `Portfolio image ${index + 1}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <Heart className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Previous button */}
          {selectedImageIndex! > 0 && (
            <button
              onClick={goToPrevious}
              className="absolute left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Next button */}
          {selectedImageIndex! < images.length - 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Image */}
          <div className="relative max-w-4xl max-h-[80vh] w-full h-full">
            <Image
              src={selectedImage.url}
              alt={selectedImage.caption || ''}
              fill
              className="object-contain"
              sizes="100vw"
            />

            {/* Caption */}
            {selectedImage.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4 text-center">
                <p>{selectedImage.caption}</p>
              </div>
            )}
          </div>

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 text-white px-4 py-2 rounded-full text-sm">
            {selectedImageIndex! + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
