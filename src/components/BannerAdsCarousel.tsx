import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getHomeBannerEntreprises, getCitizensBannerEntreprises, BannerEntreprise } from '../lib/bannerAds';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { getSupabaseImageUrl } from '../lib/imageUtils';

interface BannerSlide {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  link: string;
  isPlaceholder?: boolean;
}

interface BannerAdsCarouselProps {
  variant: 'home' | 'citizens';
  onOpenForm?: () => void;
}

export default function BannerAdsCarousel({ variant, onOpenForm }: BannerAdsCarouselProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBannerData() {
      setIsLoading(true);
      let entreprises: BannerEntreprise[] = [];

      if (variant === 'home') {
        entreprises = await getHomeBannerEntreprises();
      } else {
        entreprises = await getCitizensBannerEntreprises();
      }

      if (entreprises.length > 0) {
        const businessSlides: BannerSlide[] = entreprises.map((e) => ({
          id: e.id.toString(),
          title: e.nom,
          imageUrl: e.image_url || '/images/default-banner.jpg',
          link: `#/business/${e.id}`,
          isPlaceholder: false,
        }));
        setSlides(businessSlides);
      } else {
        const placeholderSlide: BannerSlide = {
          id: `placeholder-${variant}`,
          title: variant === 'home'
            ? t.home.partnerPromo.title
            : t.home.bannerPromo.titleCitizens,
          subtitle: variant === 'home'
            ? t.home.partnerPromo.subtitle
            : t.home.bannerPromo.subtitleCitizens,
          link: '#/subscription',
          isPlaceholder: true,
        };
        setSlides([placeholderSlide]);
      }

      setIsLoading(false);
    }

    loadBannerData();
  }, [variant, language]);

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (isLoading) {
    return (
      <div className="relative w-full max-w-5xl mx-auto h-32 sm:h-36 md:h-40 overflow-hidden rounded-3xl shadow-lg bg-gradient-to-br from-orange-100 to-amber-100 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-orange-600 text-base font-medium">{t.common.loading}</div>
        </div>
      </div>
    );
  }

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full max-w-5xl mx-auto h-32 sm:h-36 md:h-40 overflow-hidden rounded-3xl shadow-lg bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={{ opacity: 0, x: direction > 0 ? 300 : -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction < 0 ? 300 : -300 }}
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="absolute inset-0"
        >
          {currentSlide.isPlaceholder ? (
            <div className="w-full h-full flex flex-col items-center justify-center px-3 py-2 sm:px-8 sm:py-4 text-center bg-[#4A1D43] border border-[#D4AF37]">
              <div className="max-w-5xl mx-auto flex flex-col items-center w-full">
                <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2 leading-tight">
                  {currentSlide.title}
                </h2>

                <p className="text-xs sm:text-sm text-white mb-2 sm:mb-3 max-w-2xl leading-relaxed">
                  {currentSlide.subtitle}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full justify-center">
                  <p className="text-xs sm:text-sm text-white text-center">
                    <span className="mr-1">👉</span>
                    {variant === 'home' ? t.home.partnerPromo.offerLabel : t.home.bannerPromo.offerLabelCitizens}{" "}
                    <span className="font-semibold">
                      {variant === 'home' ? t.home.partnerPromo.offerStrong : t.home.bannerPromo.offerStrongCitizens}
                    </span>
                  </p>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (variant === 'citizens' && onOpenForm) {
                        onOpenForm();
                      } else {
                        const targetPage = variant === 'home' ? '#/subscription' : '#/citizens';
                        window.location.hash = targetPage;
                        setTimeout(() => {
                          const element = document.getElementById('form-inscription-entreprise');
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }, 100);
                      }
                    }}
                    className="inline-flex items-center justify-center px-4 py-2 sm:px-8 sm:py-3 rounded-full bg-[#D4AF37] text-[#4A1D43] font-semibold text-xs sm:text-sm md:text-base shadow-md hover:bg-[#E5C158] hover:shadow-lg transition-all duration-200 cursor-pointer whitespace-nowrap"
                  >
                    {variant === 'home' ? t.home.partnerPromo.cta : t.home.bannerPromo.ctaCitizens}
                    <span className="ml-1">›</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center cursor-pointer relative overflow-hidden"
              onClick={() => window.location.hash = currentSlide.link}
            >
              {currentSlide.imageUrl ? (
                <>
                  <img
                    src={getSupabaseImageUrl(currentSlide.imageUrl)}
                    alt={currentSlide.title}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('placeholder.jpg')) {
                        target.src = '/images/placeholder.jpg';
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="relative z-10 text-center px-6 py-4">
                    <div className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-orange-600 text-xs font-semibold mb-3">
                      PARTENAIRE
                    </div>
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-2xl">
                      {currentSlide.title}
                    </h3>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-500">
                  <div className="text-center px-6 py-4">
                    <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium mb-3">
                      PARTENAIRE
                    </div>
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                      {currentSlide.title}
                    </h3>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 z-10"
            aria-label="Précédent"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 z-10"
            aria-label="Suivant"
          >
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(idx);
                }}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'bg-white w-6'
                    : 'bg-white/50 hover:bg-white/80 w-2'
                }`}
                aria-label={`Aller à la slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
