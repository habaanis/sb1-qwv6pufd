import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  Mail,
  Phone,
  X,
} from 'lucide-react';
import PremiumWrapper, { PremiumBadge } from '../components/PremiumWrapper';

interface Candidate {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  category: string | null;
  skills: string[] | string | null;
  experience_years: number | null;
  languages: string[] | string | null;
  desired_contracts: string[] | string | null;
  cv_url: string | null;
  cv_text: string | null;
  availability: string | null;
  created_at: string;
  updated_at: string | null;
  visibility?: string | null;
  is_premium?: boolean | null;
  address?: string | null;
}

// 🎯 TYPES DE FILTRES D'EXPÉRIENCE
type ExperienceFilter = 'all' | '0-1' | '2-5' | '6+';

// 🧹 FONCTION DE NORMALISATION (supprime accents, met en minuscules)
const normalize = (value: string | null | undefined) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

// 🔄 CONVERTIT LES VALEURS EN TABLEAU (skills, languages peuvent être string ou array)
const toArray = (value: string[] | string | null): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
};

export default function CandidateList() {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🎛️ ÉTATS DES FILTRES
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [experienceFilter, setExperienceFilter] = useState<ExperienceFilter>('all');

  // 📥 CHARGEMENT DES CANDIDATS DEPUIS SUPABASE
  useEffect(() => {
    const loadCandidates = async () => {
      setLoading(true);
      setError(null);
      console.log('[CandidateList] 🔍 Chargement des candidats publics...');

      try {
        const { data, error } = await supabase
          .from('candidates')
          .select('*')
          .eq('visibility', 'public')
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('[CandidateList] ❌ Erreur Supabase:', error);
          throw error;
        }

        const candidatesList = (data || []) as Candidate[];

        // 📊 LOGS DE DEBUG
        console.log('[CandidateList] 📥 Candidats chargés :', candidatesList.length);
        console.log(
          '[CandidateList] 🏙️ Villes trouvées :',
          Array.from(new Set(candidatesList.map(c => c.city))).filter(Boolean)
        );
        console.log(
          '[CandidateList] 🎓 Expériences distinctes :',
          Array.from(new Set(candidatesList.map(c => c.experience_years))).sort((a, b) => (a ?? 0) - (b ?? 0))
        );

        setCandidates(candidatesList);
      } catch (e: any) {
        setError(e.message || 'Erreur de chargement des candidats');
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, []);

  // 🏙️ LISTE DES VILLES DISPONIBLES (calculée depuis les candidats)
  const cityOptions = useMemo(() => {
    const villes = Array.from(
      new Set(
        candidates
          .map((c) => (c.city || '').trim())
          .filter((v) => v && v.length > 0)
      )
    ).sort((a, b) => a.localeCompare(b, 'fr'));
    return villes;
  }, [candidates]);

  // 🧮 FILTRAGE DES CANDIDATS
  const filteredCandidates = useMemo(() => {
    const query = normalize(searchTerm);

    const result = candidates.filter((c) => {
      // 🏙️ FILTRE PAR VILLE
      const matchesCity = !selectedCity || (c.city || '').trim() === selectedCity;

      // ⏱️ FILTRE PAR EXPÉRIENCE
      const years = c.experience_years ?? 0;
      let matchesExperience = true;
      if (experienceFilter === '0-1') {
        matchesExperience = years <= 1;
      } else if (experienceFilter === '2-5') {
        matchesExperience = years >= 2 && years <= 5;
      } else if (experienceFilter === '6+') {
        matchesExperience = years >= 6;
      }

      // 🔍 FILTRE PAR RECHERCHE TEXTUELLE
      // Cherche dans : full_name, category, skills, cv_text, desired_contracts
      let matchesSearch = true;
      if (query) {
        const parts: string[] = [];

        parts.push(c.full_name || '');
        parts.push(c.category || '');
        if (c.cv_text) parts.push(c.cv_text);

        const skills = toArray(c.skills);
        const contracts = toArray(c.desired_contracts);

        parts.push(skills.join(' '));
        parts.push(contracts.join(' '));

        const haystack = normalize(parts.join(' '));
        matchesSearch = haystack.includes(query);
      }

      return matchesCity && matchesExperience && matchesSearch;
    });

    // 📊 LOG: Résultat du filtrage
    console.log('[CandidateList] 🔍 Filtres actifs :', {
      searchTerm,
      selectedCity,
      experienceFilter,
    });
    console.log('[CandidateList] ✅ Candidats affichés :', result.length);

    return result;
  }, [candidates, searchTerm, selectedCity, experienceFilter]);

  // 🏷️ LABELS POUR LES BADGES DE FILTRES ACTIFS
  const getExperienceLabel = (filter: ExperienceFilter): string => {
    const labels: Record<ExperienceFilter, string> = {
      'all': '',
      '0-1': t.candidateList.experience0to1,
      '2-5': t.candidateList.experience2to5,
      '6+': t.candidateList.experience6plus,
    };
    return labels[filter];
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 📋 EN-TÊTE */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#800020] mb-2">
            {t.candidateList.pageTitle}
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl">
            {t.candidateList.pageSubtitle}
          </p>
          <div className="mt-3 inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-[#800020] to-[#4A1D43] text-[#D4AF37] text-xs font-semibold rounded-lg border border-[#D4AF37] shadow-sm">
            Accès Réservé aux membres Elite/Premium
          </div>
        </div>

        {/* 🎛️ BLOC FILTRES */}
        <div className="mb-6 bg-white border border-[#D4AF37] rounded-xl p-4 md:p-6 shadow-sm">
          {/* 🔍 RECHERCHE PRINCIPALE */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#800020] mb-1">
              {t.candidateList.filtersTitle}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.candidateList.searchPlaceholder}
                className="w-full pl-9 pr-3 py-2.5 border border-[#D4AF37] rounded-lg text-sm focus:ring-2 focus:ring-[#800020] focus:border-[#800020]"
              />
            </div>
          </div>

          {/* 🏙️ + ⏱️ FILTRES STRUCTURÉS */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* VILLE */}
            <div>
              <label className="block text-sm font-medium text-[#800020] mb-1">
                {t.candidateList.cityLabel}
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#D4AF37] rounded-lg text-sm focus:ring-2 focus:ring-[#800020] focus:border-[#800020]"
              >
                <option value="">{t.candidateList.allCities}</option>
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* EXPÉRIENCE */}
            <div>
              <label className="block text-sm font-medium text-[#800020] mb-1">
                {t.candidateList.experienceLabel}
              </label>
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value as ExperienceFilter)}
                className="w-full px-3 py-2.5 border border-[#D4AF37] rounded-lg text-sm focus:ring-2 focus:ring-[#800020] focus:border-[#800020]"
              >
                <option value="all">{t.candidateList.allExperiences}</option>
                <option value="0-1">{t.candidateList.experience0to1}</option>
                <option value="2-5">{t.candidateList.experience2to5}</option>
                <option value="6+">{t.candidateList.experience6plus}</option>
              </select>
            </div>
          </div>
        </div>

        {/* 🏷️ BADGES DES FILTRES ACTIFS */}
        {(searchTerm || selectedCity || experienceFilter !== 'all') && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-600">{t.candidateList.activeFilters}</span>

            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 text-orange-700 text-xs border border-orange-200">
                <Search className="w-3 h-3" />
                {searchTerm}
                <button
                  onClick={() => setSearchTerm('')}
                  className="hover:bg-orange-100 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCity && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs border border-blue-200">
                <MapPin className="w-3 h-3" />
                {selectedCity}
                <button
                  onClick={() => setSelectedCity('')}
                  className="hover:bg-blue-100 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {experienceFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs border border-emerald-200">
                <Clock className="w-3 h-3" />
                {getExperienceLabel(experienceFilter)}
                <button
                  onClick={() => setExperienceFilter('all')}
                  className="hover:bg-emerald-100 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* ⏳ ÉTAT: CHARGEMENT */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-[#800020] border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-sm text-gray-600">
              {t.candidateList.loading}
            </p>
          </div>
        )}

        {/* ❌ ÉTAT: ERREUR */}
        {error && !loading && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* 📭 ÉTAT: AUCUN RÉSULTAT */}
        {!loading && !error && filteredCandidates.length === 0 && (
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-600">
              {t.candidateList.noResults}
            </p>
          </div>
        )}

        {/* 📋 LISTE DES CANDIDATS */}
        {!loading && !error && filteredCandidates.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredCandidates.map((c) => {
              const skills = toArray(c.skills);
              const languages = toArray(c.languages);
              const contracts = toArray(c.desired_contracts);

              return (
                <PremiumWrapper
                  key={c.id}
                  isPremium={c.is_premium || false}
                  variant="card"
                  showBadge={true}
                  badgePosition="top-right"
                  badgeType="certified"
                  className="bg-white border border-[#D4AF37] rounded-lg p-4 shadow-sm hover:shadow-md transition-all flex flex-col h-full"
                >
                  {/* EN-TÊTE DE LA CARTE */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1">
                      <h2 className="text-base font-bold text-[#800020] mb-1">
                        {c.category || 'Candidat'}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                        {c.city && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#800020]" />
                            {c.city}
                          </span>
                        )}
                        {typeof c.experience_years === 'number' && c.experience_years > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#800020]" />
                            {c.experience_years} {c.experience_years > 1 ? t.candidateList.years : t.candidateList.year}
                          </span>
                        )}
                      </div>
                    </div>
                    {c.is_premium && (
                      <span className="px-2 py-1 rounded-md text-xs font-bold bg-gradient-to-r from-[#800020] to-[#4A1D43] text-[#D4AF37] border border-[#D4AF37]">
                        Premium
                      </span>
                    )}
                  </div>

                  {/* COMPÉTENCES */}
                  {skills.length > 0 && (
                    <div className="mb-2">
                      <div className="flex flex-wrap gap-1.5">
                        {skills.slice(0, 5).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#800020] text-[11px] border border-[#D4AF37]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PIED DE CARTE: BOUTON ACTION */}
                  <div className="mt-auto pt-3 border-t border-[#D4AF37] flex items-center justify-between gap-3">
                    <div className="text-xs text-gray-600">
                      {c.full_name && <span className="font-medium">{c.full_name}</span>}
                    </div>

                    <button className="px-4 py-1.5 bg-gradient-to-r from-[#800020] to-[#4A1D43] text-white rounded-lg hover:from-[#900030] hover:to-[#5A2D53] transition-all text-xs font-semibold border border-[#D4AF37] shadow-sm hover:shadow-md">
                      Voir le profil
                    </button>
                  </div>
                </PremiumWrapper>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
