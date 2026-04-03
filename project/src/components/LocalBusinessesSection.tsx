import { useEffect, useState } from 'react';
import { MapPin, Store, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/BoltDatabase';
import { SafeImage } from './SafeImage';
import { parseImageUrls } from '../lib/imagekitUtils';

interface LocalBusiness {
  id: string;
  nom: string;
  ville: string | null;
  image_url: string | null;
  logo_url: string | null;
  categorie: string | null;
  'page commerce local': boolean | null;
}

interface LocalBusinessesSectionProps {
  onCardClick: (id: string) => void;
}

export const LocalBusinessesSection = ({ onCardClick }: LocalBusinessesSectionProps) => {
  const [businesses, setBusinesses] = useState<LocalBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocalBusinesses = async () => {
      setLoading(true);
      try {
        console.log('[LocalBusinessesSection] 🔍 Recherche des commerces locaux...');

        const { data, error } = await supabase
          .from('entreprise')
          .select('id, nom, ville, image_url, logo_url, categorie, "page commerce local"')
          .eq('"page commerce local"', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) {
          console.error('[LocalBusinessesSection] ❌ Erreur requête:', error);
          setBusinesses([]);
        } else {
          console.log('[LocalBusinessesSection] 📊 Données commerces locaux:', {
            count: data?.length || 0,
            data: data
          });
          setBusinesses((data || []) as LocalBusiness[]);
        }
      } catch (err) {
        console.error('[LocalBusinessesSection] 💥 Erreur inattendue:', err);
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLocalBusinesses();
  }, []);

  if (!loading && businesses.length === 0) {
    return null;
  }

  return (
    <section className="py-4 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Store className="w-5 h-5 text-[#4A1D43]" />
            <h2 className="text-lg md:text-xl font-light text-gray-900">
              Commerces Locaux
            </h2>
          </div>
          <p className="text-gray-600 text-sm">
            Soutenez nos commerçants et artisans locaux
          </p>
        </div>

        <div className="overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:overflow-visible">
          {loading ? (
            <div className="flex gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex-shrink-0 w-[260px] md:w-auto">
                  <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden animate-pulse border border-gray-200">
                    <div className="h-36 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
              {businesses.map((business) => {
                const firstImageUrl = business.image_url ? parseImageUrls(business.image_url)[0] : null;

                return (
                  <div
                    key={business.id}
                    onClick={() => onCardClick(business.id)}
                    className="group cursor-pointer flex-shrink-0 w-[260px] md:w-auto h-full"
                  >
                    <div className="relative bg-white rounded-2xl border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:scale-105 hover:border-[#4A1D43] h-full flex flex-col">
                      <div className="relative h-36 overflow-hidden bg-gray-100">
                        {firstImageUrl ? (
                          firstImageUrl.startsWith('http') ? (
                            <img
                              src={firstImageUrl}
                              alt={business.nom}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              loading="lazy"
                            />
                          ) : (
                            <SafeImage
                              src={firstImageUrl}
                              alt={business.nom}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              fallbackType="icon"
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <ShoppingBag className="w-12 h-12 text-gray-300" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                        {business.logo_url && (
                          <div className="absolute top-2 right-2 w-10 h-10 rounded-full shadow-md overflow-hidden">
                            <SafeImage
                              src={business.logo_url}
                              alt={`${business.nom} logo`}
                              className="w-full h-full"
                              style={{
                                objectFit: 'cover',
                                objectPosition: 'center',
                                borderRadius: '50%'
                              }}
                              fallbackType="icon"
                            />
                          </div>
                        )}

                        <div className="absolute top-2 left-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/95 text-[#4A1D43] text-[10px] font-semibold rounded-full shadow-md border border-[#4A1D43]/20">
                            <Store className="w-2.5 h-2.5" />
                            Local
                          </span>
                        </div>
                      </div>

                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-[#4A1D43] transition-colors min-h-[2.5rem]">
                          {business.nom}
                        </h3>

                        <div className="flex items-start gap-2 text-[11px] text-gray-600">
                          {business.ville && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#4A1D43] flex-shrink-0" />
                              <span className="line-clamp-1">{business.ville}</span>
                            </div>
                          )}
                          {business.categorie && (
                            <span className="px-1.5 py-0.5 bg-gray-100 rounded-full text-gray-700 line-clamp-1 text-[10px]">
                              {business.categorie}
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

        {!loading && businesses.length >= 6 && (
          <div className="text-center mt-4">
            <a
              href="#/entreprises?commerce_local=true"
              className="inline-flex items-center gap-2 px-5 py-2 bg-white text-[#4A1D43] font-medium rounded-lg transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:scale-105 border-2 border-[#4A1D43] text-sm"
            >
              <Store className="w-4 h-4" />
              Découvrir tous nos commerces locaux
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default LocalBusinessesSection;
