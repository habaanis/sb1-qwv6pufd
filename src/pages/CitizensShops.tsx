import { useState, useRef, useEffect } from 'react';
import { Store, Loader2, ChevronRight, Tag, MapPin, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Tables } from '../lib/dbTables';
import { FeaturedBusinessesStrip } from '../components/FeaturedBusinessesStrip';
import { LocalBusinessesSection } from '../components/LocalBusinessesSection';
import { scrollToWithOffsetDelayed } from '../lib/scrollUtils';
import { getSupabaseImageUrl } from '../lib/imageUtils';
import CategorySearchBar from '../components/CategorySearchBar';
import { useLanguage } from '../context/LanguageContext';

interface Shop {
  id: string;
  nom: string;
  ville: string | null;
  image_url: string | null;
  logo_url: string | null;
  categorie: string | null;
  sous_categories?: string | null;
  gouvernorat?: string | null;
  'page commerce local'?: boolean | null;
}

interface CitizensShopsProps {
  onNavigate?: (page: any) => void;
}

export default function CitizensShops({ onNavigate }: CitizensShopsProps = {}) {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Récupération des paramètres URL pour afficher les résultats de recherche
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const q = params.get('q');
    const ville = params.get('ville');

    if (q || ville) {
      fetchShops(q || '', ville || '');
    }
  }, []);

  const fetchShops = async (searchTerm: string, ville: string) => {
    setLoading(true);
    console.log('[CitizensShops] 🔍 Recherche lancée avec:', { searchTerm, ville });

    try {
      let query = supabase
        .from(Tables.ENTREPRISE)
        .select('id, nom, ville, image_url, logo_url, "catégorie", "sous-catégories", gouvernorat, "liste pages"')
        .contains('"liste pages"', ['commerces & magasins'])
        .order('nom', { ascending: true })
        .limit(100);

      if (ville) {
        query = query.eq('gouvernorat', ville);
      }

      if (searchTerm) {
        const searchPattern = `%${searchTerm}%`;
        query = query.or(`nom.ilike.${searchPattern},"mots cles recherche".ilike.${searchPattern},description.ilike.${searchPattern}`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[CitizensShops] ❌ Erreur requête:', error);
        throw error;
      }

      console.log('[CitizensShops] ✅ Résultats:', data?.length || 0, 'commerces');
      setShops((data || []) as Shop[]);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error('[CitizensShops] 💥 Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasActiveSearch = shops.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header avec Image de Fond */}
      <section
        className="relative w-full overflow-hidden rounded-b-2xl shadow-md h-[300px] bg-cover"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(74, 29, 67, 0.8), rgba(74, 29, 67, 0.3), transparent), url(/images/cat_magasin.jpg.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%'
        }}
      >

        {onNavigate && (
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={() => onNavigate('citizens')}
              className="flex items-center gap-2 text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors text-sm font-medium drop-shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour aux services citoyens</span>
            </button>
          </div>
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 py-6">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 drop-shadow-lg text-[#D4AF37]">
            Commerces & Magasins
          </h1>
          <p className="text-sm md:text-base font-light text-white/95 max-w-3xl leading-relaxed drop-shadow-lg">
            Votre guide des commerces de proximité en Tunisie. Trouvez un magasin ouvert maintenant, bénéficiez des promotions
            et découvrez les produits locaux. Achetez local, soutenez l'économie tunisienne.
          </p>
        </div>
      </section>

      {/* Slogan Marketing Épuré */}
      <section className="py-6 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg md:text-xl font-light mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-[#4A0404]">Vous êtes présent, mais êtes-vous trouvable ?</span>
          </p>
          <div className="flex justify-center">
            <div className="w-[40px] h-[1px] bg-[#D4AF37]"></div>
          </div>
        </div>
      </section>

      {/* Barre de Recherche */}
      <section className="py-6 px-4 relative z-50">
        <div className="max-w-5xl mx-auto">
          <CategorySearchBar
            listePageValue="commerces & magasins"
            placeholder={language === 'fr' ? 'Rechercher un commerce ou magasin...' : language === 'ar' ? 'البحث عن متجر أو محل تجاري...' : 'Search for a shop or store...'}
            onSelectBusiness={(businessId) => navigate(`/business/${businessId}`)}
            onSearch={(query, ville) => {
              fetchShops(query, ville);
            }}
          />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">


        {/* Résultats de recherche - affichés si recherche active */}
        {hasActiveSearch && (
          <div ref={resultsRef} className="mb-10">

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
                <p className="mt-3 text-sm text-gray-600 ml-3">Recherche en cours...</p>
              </div>
            ) : shops.length === 0 ? (
              <div className="text-center py-8">
                <Store className="w-10 h-10 text-[#D4AF37] mx-auto mb-3" />
                <p className="text-sm text-gray-500">Aucun établissement trouvé • Modifiez vos critères</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-light text-gray-900">
                    Résultats de votre recherche
                    <span className="ml-2 text-sm text-gray-500">
                      ({shops.length} {shops.length > 1 ? 'magasins' : 'magasin'})
                    </span>
                  </h3>
                  <button
                    onClick={() => {
                      setShops([]);
                      window.location.hash = '#/citizens/magasins';
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    Réinitialiser la recherche
                  </button>
                </div>

                {/* Shop Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shops.map((shop) => (
                      <div
                        key={shop.id}
                        onClick={() => navigate(`/business/${shop.id}`)}
                        className="bg-white rounded-xl border-2 border-green-200 hover:shadow-2xl transition-all cursor-pointer overflow-hidden group"
                      >
                        {shop.image_url && (
                          <div className="w-full h-40 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
                            <img
                              src={getSupabaseImageUrl(shop.image_url)}
                              alt={shop.nom}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-start gap-3 mb-2">
                            {shop.logo_url && (
                              <img
                                src={getSupabaseImageUrl(shop.logo_url)}
                                alt={`Logo ${shop.nom}`}
                                className="w-12 h-12 object-contain rounded-lg border border-gray-200"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 mb-1 group-hover:text-green-700 transition-colors">
                                {shop.nom}
                              </h3>
                              <p className="text-sm text-green-700 font-medium">{Array.isArray((shop as any)['sous-catégories']) ? (shop as any)['sous-catégories'].join(', ') : ((shop as any)['sous-catégories'] || Array.isArray((shop as any)['catégorie']) ? (shop as any)['catégorie']?.join?.(', ') : (shop as any)['catégorie'] || '')}</p>
                            </div>
                          </div>
                          {shop.ville && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                              <MapPin className="w-3 h-3 text-green-600" />
                              {shop.ville}
                            </p>
                          )}
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SI PAS DE RECHERCHE : afficher les magasins mis en avant et commerces locaux */}
        {!hasActiveSearch && (
          <>
            {/* Section Commerces Locaux à la Une */}
            <div className="mb-10">
              <LocalBusinessesSection
                onCardClick={(id) => navigate(`/business/${id}`)}
              />
            </div>

            {/* Section Magasins mis en avant */}
            <div className="mb-10">
              <FeaturedBusinessesStrip
                variant="magasins"
                onCardClick={(id) => navigate(`/business/${id}`)}
              />
            </div>
          </>
        )}

        {/* Business Registration Block - Bottom */}
        <div className="mt-10 relative overflow-hidden rounded-xl border border-[#D4AF37] shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-[#4A0404] via-[#8B0000] to-[#4A0404]/60"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3 p-5">
            <div>
              <h3 className="text-lg font-bold text-white mb-1 drop-shadow" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Vous êtes présent, mais êtes-vous trouvable ?
              </h3>
              <p className="text-sm text-white/90 font-light leading-snug">
                Voyez nos offres • Abonnements VIP & Premium • Augmentez votre visibilité
              </p>
            </div>
            <button
              onClick={() => {
                onNavigate?.('subscription');
                scrollToWithOffsetDelayed('form-inscription-entreprise', 100, 300);
              }}
              className="flex items-center gap-2 bg-white text-[#4A0404] px-5 py-2.5 rounded-lg font-semibold hover:bg-[#D4AF37] hover:text-white hover:shadow-xl hover:scale-105 transition-all duration-300 whitespace-nowrap shadow-md text-sm"
            >
              Voir nos offres
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
