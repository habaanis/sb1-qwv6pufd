import { useEffect, useState } from 'react';
import { MapPin, Star, Crown } from 'lucide-react';
import { supabase } from '../lib/BoltDatabase';
import { SafeImage } from './SafeImage';
import { parseImageUrls } from '../lib/imagekitUtils';

interface PremiumPartner {
  id: string;
  nom: string;
  ville: string | null;
  image_url: string | null;
  logo_url: string | null;
  categorie: string | null;
  'statut Abonnement': string | null;
  'niveau priorité abonnement': number | null;
}

interface PremiumPartnersSectionProps {
  onCardClick: (id: string) => void;
}

export const PremiumPartnersSection = ({ onCardClick }: PremiumPartnersSectionProps) => {
  const [partners, setPartners] = useState<PremiumPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPremiumPartners = async () => {
      setLoading(true);
      try {
        console.log('[PremiumPartnersSection] 🔍 Recherche des entreprises avec "mise en avant pub"...');

        // Étape 1: Récupérer les entreprises avec "mise en avant pub" cochée
        const { data: featuredData, error: featuredError } = await supabase
          .from('entreprise')
          .select('id, nom, ville, image_url, logo_url, categorie, "statut Abonnement", "niveau priorité abonnement", "mise en avant pub"')
          .eq('"mise en avant pub"', true)
          .order('"niveau priorité abonnement"', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
          .limit(4);

        if (featuredError) {
          console.error('[PremiumPartnersSection] ❌ Erreur requête featured:', featuredError);
        }

        console.log('[PremiumPartnersSection] 📊 Données à la une:', {
          count: featuredData?.length || 0,
          data: featuredData,
          error: featuredError
        });

        // Si on a 4 entreprises en avant, on les affiche
        if (featuredData && featuredData.length >= 4) {
          console.log('[PremiumPartnersSection] ✅ 4 entreprises trouvées, affichage direct');
          setPartners(featuredData.slice(0, 4) as PremiumPartner[]);
          setLoading(false);
          return;
        }

        // Étape 2: Compléter avec les abonnés Premium/Elite si besoin
        const neededCount = 4 - (featuredData?.length || 0);
        console.log(`[PremiumPartnersSection] ⚠️ Seulement ${featuredData?.length || 0} entreprises trouvées, recherche de ${neededCount} complémentaires...`);

        const { data: fallbackData, error: fallbackError } = await supabase
          .from('entreprise')
          .select('id, nom, ville, image_url, logo_url, categorie, "statut Abonnement", "niveau priorité abonnement"')
          .or('"mise en avant pub".is.null,"mise en avant pub".eq.false')
          .or('"statut Abonnement".ilike.%Elite Pro%,"statut Abonnement".ilike.%Premium%,"statut Abonnement".ilike.%Elite%')
          .order('"niveau priorité abonnement"', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
          .limit(neededCount);

        if (fallbackError) {
          console.error('[PremiumPartnersSection] ❌ Erreur requête fallback:', fallbackError);
        }

        console.log('[PremiumPartnersSection] 📊 Données fallback:', {
          count: fallbackData?.length || 0,
          data: fallbackData,
          error: fallbackError
        });

        // Combiner les résultats: Mise en avant d'abord, puis fallback
        const combinedPartners = [
          ...(featuredData || []),
          ...(fallbackData || [])
        ].slice(0, 4) as PremiumPartner[];

        console.log('[PremiumPartnersSection] ✅ Total final:', combinedPartners.length, 'entreprises');
        setPartners(combinedPartners);

      } catch (err) {
        console.error('[PremiumPartnersSection] 💥 Erreur inattendue:', err);
        setPartners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPremiumPartners();
  }, []);

  const isPremiumSubscription = (statut: string | null | undefined): boolean => {
    if (!statut) return false;
    const s = statut.toLowerCase();
    return s.includes('elite') || s.includes('premium');
  };

  const getBadgeConfig = (statut: string | null | undefined) => {
    if (!statut) return { label: 'Nouveau', color: 'from-gray-400 to-gray-500', icon: Star };

    const s = statut.toLowerCase();
    if (s.includes('elite pro') || s.includes('elite')) {
      return { label: 'Elite', color: 'from-[#4A1D43] to-[#5A2D53]', icon: Crown };
    }
    if (s.includes('premium')) {
      return { label: 'Premium', color: 'from-[#D4AF37] to-[#FFD700]', icon: Star };
    }
    return { label: 'Nouveau', color: 'from-gray-400 to-gray-500', icon: Star };
  };

  return (
    <section className="py-4 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4">
          <h2 className="text-lg md:text-xl font-light text-gray-900 mb-2">
            Établissements à la Une
          </h2>
          <p className="text-gray-600 text-sm">
            Découvrez nos établissements premium et leurs services d'excellence
          </p>
        </div>

        <div className="overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:overflow-visible">
          {loading ? (
            <div className="flex gap-5 md:grid md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-shrink-0 w-[280px] md:w-auto">
                  <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-5">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun établissement à afficher pour le moment
            </div>
          ) : (
            <div className="flex gap-5 md:grid md:grid-cols-2 lg:grid-cols-4">
              {partners.map((partner) => {
                const badge = getBadgeConfig(partner['statut Abonnement']);
                const BadgeIcon = badge.icon;
                const firstImageUrl = partner.image_url ? parseImageUrls(partner.image_url)[0] : null;

                return (
                  <div
                    key={partner.id}
                    onClick={() => onCardClick(partner.id)}
                    className="group cursor-pointer flex-shrink-0 w-[200px] md:w-auto h-full"
                    style={{ maxWidth: '240px' }}
                  >
                    <div className="relative bg-white rounded-2xl border border-[#D4AF37] shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(74,29,67,0.15)] hover:scale-105 h-full flex flex-col">
                      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-[#4A1D43] to-[#2C1028] flex items-center justify-center">
                        {partner.logo_url ? (
                          <div className="w-20 h-20 rounded-full shadow-lg overflow-hidden">
                            <SafeImage
                              src={partner.logo_url}
                              alt={`${partner.nom} logo`}
                              className="w-full h-full"
                              style={{
                                objectFit: 'cover',
                                objectPosition: 'center',
                                borderRadius: '50%'
                              }}
                              fallbackType="icon"
                            />
                          </div>
                        ) : firstImageUrl ? (
                          <div className="w-20 h-20 rounded-full shadow-lg overflow-hidden">
                            {firstImageUrl.startsWith('http') ? (
                              <img
                                src={firstImageUrl}
                                alt={partner.nom}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <SafeImage
                                src={firstImageUrl}
                                alt={partner.nom}
                                className="w-full h-full object-cover"
                                fallbackType="icon"
                              />
                            )}
                          </div>
                        ) : null}

                        <div className="absolute top-2 left-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r ${badge.color} text-white text-[10px] font-semibold rounded-full shadow-lg`}>
                            <BadgeIcon className="w-2.5 h-2.5 fill-current" />
                            {badge.label}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1.5 line-clamp-2 group-hover:text-[#4A1D43] transition-colors min-h-[2.5rem]">
                          {partner.nom}
                        </h3>

                        <div className="flex flex-col gap-1 text-[11px] text-gray-600">
                          {partner.ville && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#4A1D43] flex-shrink-0" />
                              <span className="line-clamp-1">{partner.ville}</span>
                            </div>
                          )}
                          {partner.categorie && (
                            <span className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-700 line-clamp-1 text-center">
                              {partner.categorie}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!loading && partners.length >= 4 && (
          <div className="text-center mt-4">
            <a
              href="#/entreprises?premium=true"
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#4A1D43] text-[#D4AF37] font-medium rounded-lg transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.4)] hover:scale-105 border border-[#D4AF37] text-sm"
            >
              Voir tous nos établissements premium
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default PremiumPartnersSection;
