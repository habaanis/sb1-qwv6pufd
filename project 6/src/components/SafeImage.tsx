import { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface SafeImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallbackType?: 'placeholder' | 'icon';
  onError?: () => void;
}

export const SafeImage = ({
  src,
  alt,
  className = '',
  style,
  fallbackType = 'placeholder',
  onError
}: SafeImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    console.warn(`[SafeImage] Échec chargement image: ${src}`);
    setImageError(true);
    setIsLoading(false);
    if (onError) {
      onError();
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (!src || imageError) {
    if (fallbackType === 'icon') {
      return (
        <div className={`flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 ${className}`}>
          <ImageOff className="w-12 h-12 text-gray-400 mb-2" />
          <span className="text-xs text-gray-500 px-4 text-center">Image non disponible</span>
        </div>
      );
    }

    return (
      <div className={`bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 animate-pulse ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center p-4">
            <ImageOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Image indisponible</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className={`absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse ${className}`} />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={style}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </div>
  );
};
