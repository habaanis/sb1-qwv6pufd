import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Image as ImageIcon, Maximize2 } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { getGalleryImageUrls } from '../lib/imagekitUtils';

interface ImageGalleryProps {
  imageUrls: string | null | undefined;
  altText: string;
  className?: string;
  maxPhotos?: number;
  height?: string;
  objectFit?: 'cover' | 'contain';
}

export const ImageGallery = ({ imageUrls, altText, className = '', maxPhotos, height = '120px', objectFit = 'contain' }: ImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);

  let thumbnailUrls = getGalleryImageUrls(imageUrls, 'thumbnail');
  let fullUrls = getGalleryImageUrls(imageUrls, 'full');

  if (maxPhotos && maxPhotos > 0) {
    thumbnailUrls = thumbnailUrls.slice(0, maxPhotos);
    fullUrls = fullUrls.slice(0, maxPhotos);
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? thumbnailUrls.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === thumbnailUrls.length - 1 ? 0 : prev + 1));
  };

  if (thumbnailUrls.length === 0) {
    return null;
  }

  return (
    <div className={`w-full max-w-full`}>
      {/* Carrousel principal - Bannière fine */}
      <div className={`relative overflow-hidden shadow-lg w-full ${className}`} style={{ height }}>
        {/* Fond flouté de l'image */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src={thumbnailUrls[currentIndex]}
            alt={`${altText} - Fond`}
            className="w-full h-full object-cover blur-xl scale-110 opacity-40"
          />
        </div>

        {/* Image principale */}
        <ImageWithFallback
          src={thumbnailUrls[currentIndex]}
          alt={`${altText} - Image ${currentIndex + 1}`}
          className={`relative w-full h-full object-${objectFit} cursor-pointer transition-transform duration-300 hover:scale-105`}
          onClick={() => setShowFullscreen(true)}
        />

        {/* Badge zoom - miniature */}
        <button
          onClick={() => setShowFullscreen(true)}
          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1 rounded backdrop-blur-sm transition-all"
          title="Agrandir"
        >
          <Maximize2 size={12} />
        </button>

        {/* Indicateur de position - miniature */}
        <div className="absolute bottom-2 right-2 bg-gradient-to-r from-[#4A1D43] to-[#5A2D53] text-[#D4AF37] px-2 py-0.5 rounded-full text-[10px] font-medium shadow-lg">
          {currentIndex + 1}/{thumbnailUrls.length}
        </div>

        {/* Boutons de navigation - miniatures */}
        {thumbnailUrls.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#4A1D43] to-[#5A2D53] hover:from-[#5A2D53] hover:to-[#6A3D63] text-[#D4AF37] p-1 rounded-full shadow-xl transition-all hover:scale-110"
              title="Image précédente"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#4A1D43] to-[#5A2D53] hover:from-[#5A2D53] hover:to-[#6A3D63] text-[#D4AF37] p-1 rounded-full shadow-xl transition-all hover:scale-110"
              title="Image suivante"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Mode plein écran - Design amélioré */}
      {showFullscreen && (
        <div
          className="fixed inset-0 bg-black/98 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowFullscreen(false)}
        >
          {/* Bouton fermer */}
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-6 right-6 bg-gradient-to-r from-[#4A1D43] to-[#5A2D53] text-[#D4AF37] hover:scale-110 p-3 rounded-full shadow-2xl transition-all z-10"
            title="Fermer"
          >
            <X size={28} />
          </button>

          {/* Image principale */}
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={fullUrls[currentIndex]}
              alt={`${altText} - Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Navigation en plein écran */}
            {thumbnailUrls.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#4A1D43] to-[#5A2D53] hover:from-[#5A2D53] hover:to-[#6A3D63] text-[#D4AF37] p-4 rounded-full shadow-2xl transition-all hover:scale-110"
                  title="Image précédente"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#4A1D43] to-[#5A2D53] hover:from-[#5A2D53] hover:to-[#6A3D63] text-[#D4AF37] p-4 rounded-full shadow-2xl transition-all hover:scale-110"
                  title="Image suivante"
                >
                  <ChevronRight size={32} />
                </button>

                {/* Compteur en plein écran */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#4A1D43] to-[#5A2D53] text-[#D4AF37] px-6 py-3 rounded-full shadow-2xl font-medium">
                  Photo {currentIndex + 1} sur {thumbnailUrls.length}
                </div>

                {/* Miniatures en bas (plein écran) */}
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 max-w-3xl">
                  <div className="flex gap-2 overflow-x-auto pb-2 px-4">
                    {thumbnailUrls.map((url, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentIndex(index);
                        }}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentIndex
                            ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50 scale-110'
                            : 'border-gray-500 opacity-50 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        <ImageWithFallback
                          src={url}
                          alt={`${altText} - Miniature ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
