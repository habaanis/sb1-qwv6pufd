import { MapPin, Award, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { ImageWithFallback } from './ImageWithFallback';
import { extractMainCategory, getAllKeywords } from '../lib/categoryDisplay';
import { getFeaturedImageUrl } from '../lib/imagekitUtils';
import { mapSubscriptionToTier, getPriorityLevel } from '../lib/subscriptionTiers';
import SignatureCard from './SignatureCard';
import {
  isCurrentlyOpen,
  translateOpenStatus,
  translateClosedStatus,
  getTodaySchedule,
  formatTodayScheduleText,
  translateSeeMore,
  translateSeeLess,
  parseHoraires,
  getDayName
} from '../lib/horaireUtils';
import { useCategoryTranslation } from '../hooks/useCategoryTranslation';
import { getMultilingualField } from '../lib/databaseI18n';
import { getLogoUrl, getLogoStyle, getLogoContainerStyle } from '../lib/logoUtils';
import { RatingBadge } from './GoogleRating';

interface BusinessCardProps {
  business: {
    id: string;
    name: string;
    category?: string;
    gouvernorat?: string;
    statut_abonnement?: string | null;
    'niveau priorité abonnement'?: number | null;
    badges?: string[];
    imageUrl?: string | null;
    logoUrl?: string | null;
    horaires_ok?: string | null;
    note_google?: string | number | null;
    'Note Google Globale'?: string | number | null;
    nombre_avis?: string | number | null;
    'Compteur Avis Google'?: string | number | null;
  };
  onClick: () => void;
  variant?: 'simple' | 'premium';
}

export const BusinessCard = ({ business, onClick, variant = 'simple' }: BusinessCardProps) => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const { getCategory } = useCategoryTranslation();
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  const tier = mapSubscriptionToTier({
    statut_abonnement: business.statut_abonnement,
    'niveau priorité abonnement': business['niveau priorité abonnement']
  });

  // Récupération de la catégorie traduite avec fallback
  const rawCategory = getMultilingualField(business, 'category', language, true) ||
                      getMultilingualField(business, 'categorie', language, true) ||
                      business.category ||
                      business.categorie ||
                      '';

  const mainCategory = extractMainCategory(rawCategory);
  const translatedCategory = getCategory(mainCategory);
  const allKeywords = getAllKeywords(rawCategory);

  // Mapper le tier vers le format de SignatureCard
  const signatureTier: 'decouverte' | 'artisan' | 'premium' | 'elite' | 'custom' =
    tier === 'gratuit' ? 'decouverte' : tier;

  // Définir les couleurs de texte selon le tier
  let titleColor: string;
  let secondaryTextColor: string;
  let accentColor: string;
  let paddingClass: string;
  let displayImage: string | null | undefined;

  switch (tier) {
    case 'elite':
      // Fond Noir (#121212) -> Textes Or et Blanc
      titleColor = '#D4AF37';
      secondaryTextColor = '#E8E8E8';
      accentColor = '#D4AF37';
      paddingClass = 'p-6';
      displayImage = getFeaturedImageUrl(business.logoUrl, business.imageUrl);
      break;

    case 'premium':
      // Fond Vert Émeraude (#064E3B) -> Textes Or et Blanc
      titleColor = '#D4AF37';
      secondaryTextColor = '#E8E8E8';
      accentColor = '#D4AF37';
      paddingClass = 'p-5';
      displayImage = getFeaturedImageUrl(business.logoUrl, business.imageUrl);
      break;

    case 'artisan':
      // Fond Bordeaux/Prune (#4A1D43) -> Textes Or et Blanc
      titleColor = '#D4AF37';
      secondaryTextColor = '#E8E8E8';
      accentColor = '#D4AF37';
      paddingClass = 'p-5';
      displayImage = getFeaturedImageUrl(business.logoUrl, business.imageUrl);
      break;

    case 'gratuit':
    default:
      // Fond Blanc -> Textes Sombres
      titleColor = '#1A1A1A';
      secondaryTextColor = '#6B7280';
      accentColor = '#D4AF37';
      paddingClass = 'p-4';
      displayImage = business.logoUrl;
      break;
  }

  const isMinimal = tier === 'gratuit';
  const isElite = tier === 'elite';
  const isPremiumTier = tier === 'premium' || tier === 'elite' || tier === 'artisan';

  return (
    <div className="block cursor-pointer" onClick={onClick}>
      <SignatureCard
        tier={signatureTier}
        className={paddingClass}
      >
      <div style={{ position: 'relative', minHeight: isMinimal ? '180px' : 'auto' }}>
        {isElite && (
          <div className="absolute top-0 right-0 z-10">
            <div className="flex items-center gap-1 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#121212] px-3 py-1.5 rounded-full shadow-lg text-xs font-bold">
              <Award size={14} />
              <span>ÉLITE PRO</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: isMinimal ? '6px' : isElite ? '16px' : '12px' }}>
        {/* Header avec logo rond centralisé - Modèle Elite unifié */}
        <div className="flex justify-center -mt-4 mb-2">
          <div
            className={`${
              isMinimal ? 'w-14 h-14' : isElite ? 'w-20 h-20' : 'w-16 h-16'
            } shadow-xl`}
            style={getLogoContainerStyle(accentColor, '3px')}
          >
            <img
              src={getLogoUrl(displayImage)}
              alt={business.name}
              className="w-full h-full"
              style={getLogoStyle(displayImage)}
            />
          </div>
        </div>

        <div>
          <h3
            style={{
              fontSize: isMinimal ? '14px' : isElite ? '20px' : tier === 'premium' || tier === 'artisan' ? '18px' : '16px',
              fontWeight: '700',
              color: titleColor,
              lineHeight: '1.3',
              marginBottom: '4px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              letterSpacing: '-0.01em'
            }}
          >
            {business.name}
          </h3>
          {translatedCategory && (
            <>
              <p
                style={{
                  fontSize: isMinimal ? '11px' : '13px',
                  fontWeight: '500',
                  color: secondaryTextColor,
                  lineHeight: '1.4',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {translatedCategory}
              </p>
              <meta name="keywords" content={allKeywords.join(', ')} />
              <span className="sr-only">{allKeywords.join(' ')}</span>
            </>
          )}
        </div>

        {business.gouvernorat && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '2px' }}>
            <MapPin className={`${isMinimal ? 'w-3 h-3' : 'w-4 h-4'}`} style={{ color: accentColor, flexShrink: 0 }} />
            <span style={{ fontSize: isMinimal ? '11px' : '14px', fontWeight: '500', color: secondaryTextColor }}>
              {business.gouvernorat}
            </span>
          </div>
        )}

        {/* Note Google avec étoile dorée */}
        <RatingBadge
          rating={business.note_google || business['Note Google Globale']}
          reviewCount={business.nombre_avis || business['Compteur Avis Google']}
          className="mt-1"
        />

        {business.horaires_ok && (
          <div style={{ paddingTop: '4px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFullSchedule(!showFullSchedule);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 0',
                textAlign: 'left'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Clock className={`${isMinimal ? 'w-3 h-3' : 'w-4 h-4'}`} style={{ color: isCurrentlyOpen(business.horaires_ok) ? '#10B981' : '#EF4444', flexShrink: 0 }} />
                  <span
                    style={{
                      fontSize: isMinimal ? '10px' : '12px',
                      fontWeight: '600',
                      color: isCurrentlyOpen(business.horaires_ok) ? '#10B981' : '#EF4444'
                    }}
                  >
                    {isCurrentlyOpen(business.horaires_ok)
                      ? translateOpenStatus(language)
                      : translateClosedStatus(language)
                    }
                  </span>
                </div>

                <div style={{ fontSize: isMinimal ? '10px' : '11px', color: secondaryTextColor, lineHeight: '1.3' }}>
                  {formatTodayScheduleText(getTodaySchedule(business.horaires_ok), language)}
                </div>
              </div>

              <ChevronDown
                size={isMinimal ? 14 : 16}
                style={{
                  color: accentColor,
                  transform: showFullSchedule ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}
              />
            </button>

            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                maxHeight: showFullSchedule ? '500px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease, opacity 0.3s ease',
                opacity: showFullSchedule ? 1 : 0
              }}
            >
              <div
                style={{
                  padding: isMinimal ? '6px' : '8px',
                  backgroundColor: isPremiumTier ? 'rgba(212, 175, 55, 0.1)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '8px',
                  fontSize: isMinimal ? '10px' : '11px',
                  lineHeight: '1.5',
                  marginTop: '4px'
                }}
              >
                {parseHoraires(business.horaires_ok).map((schedule, index) => {
                  const now = new Date();
                  const todayIndex = (now.getDay() + 6) % 7;
                  const dayIndex = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].findIndex(d => schedule.day.includes(d));
                  const isToday = dayIndex === todayIndex;

                  return (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        padding: '6px 8px',
                        backgroundColor: isToday
                          ? isPremiumTier ? 'rgba(212, 175, 55, 0.15)' : 'rgba(59, 130, 246, 0.08)'
                          : index % 2 === 0
                            ? 'transparent'
                            : isPremiumTier ? 'rgba(212, 175, 55, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        borderRadius: '4px',
                        marginBottom: index < parseHoraires(business.horaires_ok).length - 1 ? '2px' : '0',
                        gap: '12px'
                      }}
                    >
                      <span
                        style={{
                          minWidth: isMinimal ? '70px' : '90px',
                          maxWidth: isMinimal ? '90px' : '110px',
                          flexShrink: 0,
                          fontWeight: isToday ? '700' : '500',
                          color: schedule.isOpen
                            ? isPremiumTier ? '#D4AF37' : '#1A1A1A'
                            : '#FF6B6B',
                          wordWrap: 'break-word',
                          lineHeight: '1.3'
                        }}
                      >
                        {schedule.day}
                      </span>
                      <span
                        style={{
                          flex: 1,
                          fontWeight: isToday ? '600' : '400',
                          color: schedule.isOpen
                            ? isPremiumTier
                              ? (isToday ? '#D4AF37' : '#E8E8E8')
                              : (isToday ? '#1A1A1A' : '#6B7280')
                            : '#FF6B6B',
                          wordWrap: 'break-word',
                          lineHeight: '1.3'
                        }}
                      >
                        {schedule.hours}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          style={{
            width: '100%',
            marginTop: '2px',
            paddingTop: isMinimal ? '6px' : '12px',
            borderTop: isPremiumTier ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(0, 0, 0, 0.08)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'block'
          }}
        >
          <span
            style={{
              fontSize: isMinimal ? '11px' : '14px',
              fontWeight: '700',
              color: accentColor,
              textDecoration: 'none',
              letterSpacing: '0.01em'
            }}
            className="hover:underline"
          >
            {t.common.viewDetails} →
          </span>
        </button>
        </div>
      </div>
      </SignatureCard>
    </div>
  );
};
