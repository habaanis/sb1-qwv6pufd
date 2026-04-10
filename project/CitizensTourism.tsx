import { useState, useRef, useEffect } from 'react';
import { Plane, Loader2, MapPin, ArrowLeft, Globe } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Tables } from '../lib/dbTables';
import SearchBar from '../components/SearchBar';
import { FeaturedBusinessesStrip } from '../components/FeaturedBusinessesStrip';
import { scrollToWithOffsetDelayed } from '../lib/scrollUtils';
import { getSupabaseImageUrl } from '../lib/imageUtils';
import UnifiedBusinessCard from '../components/UnifiedBusinessCard';
import { BusinessDetail } from '../components/BusinessDetail';
import { useNavigate } from '../lib/url';

interface Business {
  id: string;
  nom: string;
  ville: string;
  gouvernorat: string;
  adresse?: string;
  telephone?: string;
  site_web?: string;
  email?: string;
  image_url?: string;
  logo_url?: string;
  categorie?: string;
  sous_categories?: string;
  description?: string;
  horaires?: string;
}

interface CitizensTourismProps {
  onNavigate?: (page: any) => void;
}

export default function CitizensTourism({ onNavigate }: CitizensTourismProps = {}) {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const q = params.get('q');
    const ville = params.get('ville');

    if (q || ville) {
      fetchBusinesses(q || '', ville || '');
    }
  }, []);

  const fetchBusinesses = async (searchTerm: string, ville: string) => {
    setLoading(true);
    console.log('[CitizensTourism] Recherche lancée avec:', { searchTerm, ville });

    try {
      let query = supabase
        .from(Tables.ENTREPRISE)
        .select('id, nom, ville, gouvernorat, adresse, telephone, site_web, email, image_url, logo_url, categorie, sous_categories, description, horaires')
        .contains('"liste pages"', ['tourisme local & expatriation'])
        .order('nom', { ascending: true })
        .limit(100);

      if (ville) {
        query = query.eq('gouvernorat', ville);
      }

      if (searchTerm) {
        const searchPattern = `%${searchTerm}%`;
        query = query.or(`nom.ilike.${searchPattern},"sous categories".ilike.${searchPattern},"mots cles recherche".ilike.${searchPattern}`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[CitizensTourism] Erreur requête:', error);
        throw error;
      }

      console.log('[CitizensTourism] Résultats:', data?.length || 0, 'entreprises');
      setBusinesses((data || []) as Business[]);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error('[CitizensTourism] Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasActiveSearch = businesses.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <section className="relative w-full h-[280px] overflow-hidden">
        <img
          src={getSupabaseImageUrl('entreprise_banner.webp')}
          alt="Tourisme Local & Expatriation"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#4A1D43]/80 via-[#4A1D43]/70 to-transparent"></div>

        {onNavigate && (
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm text-[#4A1D43] rounded-lg shadow-lg hover:bg-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium text-sm">Retour</span>
            </button>
          </div>
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 py-6">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 drop-shadow-lg text-[#D4AF37]">
            Tourisme Local & Expatriation
          </h1>
          <p className="text-sm md:text-base font-light text-white/95 max-w-3xl leading-relaxed drop-shadow-lg">
            Découvrez les meilleurs services pour touristes et expatriés en Tunisie. Hébergement, guides touristiques, services d'immigration et plus encore.
          </p>
        </div>
      </section>

      <section className="py-6 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg md:text-xl font-light mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-[#4A0404]">Votre guide pour un séjour réussi en Tunisie</span>
          </p>
          <div className="flex justify-center">
            <div className="w-[40px] h-[1px] bg-[#D4AF37]"></div>
          </div>
        </div>
      </section>

      <section className="py-2 px-4 relative z-50">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#D4AF37] p-2.5 md:p-3">
            <SearchBar scope="tourism" intentEnabled={false} enabled />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <FeaturedBusinessesStrip onCardClick={(id) => window.location.hash = `#/entreprises/${id}`} />

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
          </div>
        )}

        {hasActiveSearch && !loading && (
          <div ref={resultsRef} className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Résultats de recherche ({businesses.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business) => (
                <UnifiedBusinessCard
                  key={business.id}
                  business={business as any}
                  onClick={() => setSelectedBusiness(business)}
                />
              ))}
            </div>
          </div>
        )}

        {!hasActiveSearch && !loading && (
          <div className="text-center py-12">
            <Globe className="w-16 h-16 mx-auto text-[#D4AF37] mb-4" />
            <p className="text-gray-600">
              Utilisez la barre de recherche pour trouver des services touristiques
            </p>
          </div>
        )}
      </div>

      {selectedBusiness && (
        <BusinessDetail
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
          asModal={true}
        />
      )}
    </div>
  );
}
