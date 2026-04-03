import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { supabase } from '../lib/BoltDatabase';
import { Search, MapPin, Phone, Mail, Globe, Building2, X, Plus, Handshake, Briefcase, Calendar } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  category: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  description: string;
}

interface BusinessesProps {
  showSuggestionForm?: boolean;
  onCloseSuggestionForm?: () => void;
  onNavigateToPartnerSearch?: () => void;
  onNavigateToJobs?: () => void;
  onNavigateToBusinessEvents?: () => void;
  initialSearchKeyword?: string;
  initialSearchCity?: string;
  onClearSearch?: () => void;
}

export const Businesses = ({
  showSuggestionForm = false,
  onCloseSuggestionForm,
  onNavigateToPartnerSearch,
  onNavigateToJobs,
  onNavigateToBusinessEvents,
  initialSearchKeyword = '',
  initialSearchCity = '',
  onClearSearch
}: BusinessesProps) => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearchKeyword || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState(initialSearchCity || '');
  const [showSuggestForm, setShowSuggestForm] = useState(showSuggestionForm);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [searching, setSearching] = useState(false);

  const [suggestionForm, setSuggestionForm] = useState({
    name: '',
    category: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    submitterEmail: '',
  });

  useEffect(() => {
    setShowSuggestForm(showSuggestionForm);
  }, [showSuggestionForm]);

  useEffect(() => {
    if (initialSearchKeyword || initialSearchCity) {
      setSearchTerm(initialSearchKeyword || '');
      setSelectedCity(initialSearchCity || '');
    }
  }, [initialSearchKeyword, initialSearchCity]);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 1 || selectedCity || selectedCategory) {
        performSearch();
      } else {
        fetchBusinesses();
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCity, selectedCategory]);

  const fetchBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('entreprise')
        .select('id, nom, categories, sous_categories, ville, adresse, telephone, site_web, email, description, tags')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const mappedData = (data || []).map((item: any) => ({
        id: item.id,
        name: item.nom,
        category: item.categories || '',
        city: item.ville || '',
        address: item.adresse || '',
        phone: item.telephone || '',
        email: item.email || '',
        website: item.site_web || '',
        description: item.description || '',
      }));

      setBusinesses(mappedData);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const normalizeString = (str: string): string => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  };

  const performSearch = async () => {
    if (searchTerm.length === 0 && !selectedCity && !selectedCategory) {
      fetchBusinesses();
      return;
    }

    setSearching(true);
    try {
      const normalizedKeyword = normalizeString(searchTerm);
      const normalizedCity = normalizeString(selectedCity);

      let query = supabase
        .from('entreprise')
        .select('id, nom, categories, sous_categories, ville, adresse, telephone, site_web, email, description, tags')
        .eq('status', 'approved');

      if (searchTerm.length >= 1) {
        query = query.or(`nom.ilike.%${normalizedKeyword}%,categories.ilike.%${normalizedKeyword}%,sous_categories.ilike.%${normalizedKeyword}%,tags.ilike.%${normalizedKeyword}%,description.ilike.%${normalizedKeyword}%`);
      }

      if (selectedCity) {
        query = query.ilike('ville', `%${normalizedCity}%`);
      }

      if (selectedCategory) {
        query = query.ilike('categories', `%${selectedCategory}%`);
      }

      query = query.limit(30);

      const { data, error } = await query;

      if (error) throw error;

      const mappedData = (data || []).map((item: any) => ({
        id: item.id,
        name: item.nom,
        category: item.categories || '',
        city: item.ville || '',
        address: item.adresse || '',
        phone: item.telephone || '',
        email: item.email || '',
        website: item.site_web || '',
        description: item.description || '',
      }));

      setBusinesses(mappedData);
    } catch (error) {
      console.error('Error searching businesses:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('business_suggestions').insert([
        {
          name: suggestionForm.name,
          category: suggestionForm.category,
          city: suggestionForm.city,
          address: suggestionForm.address,
          phone: suggestionForm.phone,
          email: suggestionForm.email,
          website: suggestionForm.website || null,
          description: suggestionForm.description,
          submitted_by_email: suggestionForm.submitterEmail || null,
        },
      ]);

      if (error) throw error;

      alert(t.businesses.form.success);
      setSuggestionForm({
        name: '',
        category: '',
        city: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        description: '',
        submitterEmail: '',
      });
      setShowSuggestForm(false);
      if (onCloseSuggestionForm) onCloseSuggestionForm();
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      alert(t.businesses.form.error);
    }
  };

  const categories = [...new Set(businesses.map((b) => b.category).filter(Boolean))].sort();
  const cities = [...new Set(businesses.map((b) => b.city).filter(Boolean))].sort();

  const filteredBusinesses = businesses;

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 md:p-12 shadow-sm border border-orange-100">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-medium text-orange-800 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                {t.home.mission.footer}
              </h1>
              <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                {t.home.mission.title}
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {t.home.mission.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-light text-gray-900">{t.businesses.title}</h2>
          <button
            onClick={() => setShowSuggestForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t.home.suggestBusiness}
          </button>
        </div>

        {showSuggestForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-medium text-gray-900">{t.businesses.suggestTitle}</h2>
                <button
                  onClick={() => {
                    setShowSuggestForm(false);
                    if (onCloseSuggestionForm) onCloseSuggestionForm();
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSuggestionSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.businesses.form.name} *</label>
                  <input
                    type="text"
                    required
                    value={suggestionForm.name}
                    onChange={(e) => setSuggestionForm({ ...suggestionForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.businesses.form.category} *</label>
                    <input
                      type="text"
                      required
                      value={suggestionForm.category}
                      onChange={(e) => setSuggestionForm({ ...suggestionForm, category: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.businesses.form.city} *</label>
                    <input
                      type="text"
                      required
                      value={suggestionForm.city}
                      onChange={(e) => setSuggestionForm({ ...suggestionForm, city: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.businesses.form.address} *</label>
                  <input
                    type="text"
                    required
                    value={suggestionForm.address}
                    onChange={(e) => setSuggestionForm({ ...suggestionForm, address: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.businesses.form.phone} *</label>
                    <input
                      type="tel"
                      required
                      value={suggestionForm.phone}
                      onChange={(e) => setSuggestionForm({ ...suggestionForm, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.businesses.form.email} *</label>
                    <input
                      type="email"
                      required
                      value={suggestionForm.email}
                      onChange={(e) => setSuggestionForm({ ...suggestionForm, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.businesses.form.website}</label>
                  <input
                    type="url"
                    value={suggestionForm.website}
                    onChange={(e) => setSuggestionForm({ ...suggestionForm, website: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.businesses.form.description} *</label>
                  <textarea
                    required
                    rows={3}
                    value={suggestionForm.description}
                    onChange={(e) => setSuggestionForm({ ...suggestionForm, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.businesses.form.submitterEmail}</label>
                  <input
                    type="email"
                    value={suggestionForm.submitterEmail}
                    onChange={(e) => setSuggestionForm({ ...suggestionForm, submitterEmail: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSuggestForm(false);
                      if (onCloseSuggestionForm) onCloseSuggestionForm();
                    }}
                    className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  >
                    {t.businesses.form.submit}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer border border-blue-100">
            <div className="flex items-center justify-center w-14 h-14 bg-white rounded-full mb-4 mx-auto group-hover:scale-110 transition-transform">
              <Handshake className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-light text-gray-900 mb-3 text-center italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {t.businesses.categories.partners.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4 text-center">
              {t.businesses.categories.partners.description}
            </p>
            <button
              onClick={onNavigateToPartnerSearch}
              className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t.businesses.categories.partners.button}
            </button>
          </div>

          <div className="group bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer border border-orange-100">
            <div className="flex items-center justify-center w-14 h-14 bg-white rounded-full mb-4 mx-auto group-hover:scale-110 transition-transform">
              <Briefcase className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="text-lg font-light text-gray-900 mb-3 text-center italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {t.businesses.categories.jobs.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4 text-center">
              {t.businesses.categories.jobs.description}
            </p>
            <button
              onClick={onNavigateToJobs}
              className="w-full px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              {t.businesses.categories.jobs.button}
            </button>
          </div>

          <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer border border-green-100">
            <div className="flex items-center justify-center w-14 h-14 bg-white rounded-full mb-4 mx-auto group-hover:scale-110 transition-transform">
              <Calendar className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-lg font-light text-gray-900 mb-3 text-center italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {t.businesses.categories.events.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4 text-center">
              {t.businesses.categories.events.description}
            </p>
            <button
              onClick={onNavigateToBusinessEvents}
              className="w-full px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {t.businesses.categories.events.button}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t.businesses.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">{t.businesses.allCategories}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">{t.businesses.allCities}</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {(loading || searching) ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-sm text-gray-600">{searching ? t.businesses.searching || t.common.loading : t.common.loading}</p>
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">{t.common.noResults}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBusinesses.map((business) => (
              <div
                key={business.id}
                onClick={() => setSelectedBusiness(business)}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
              >
                <h3 className="text-base font-medium text-gray-900 mb-2">{business.name}</h3>
                <p className="text-xs text-gray-600 mb-1">{business.category}</p>
                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {business.city}
                </p>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{business.description}</p>
                <span className="text-sm text-orange-600 font-medium hover:underline">
                  {t.common.viewDetails} →
                </span>
              </div>
            ))}
          </div>
        )}

        {selectedBusiness && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-orange-600 text-white px-6 py-6">
                <button
                  onClick={() => setSelectedBusiness(null)}
                  className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-light mb-1">{selectedBusiness.name}</h2>
                <p className="text-sm text-orange-100">{selectedBusiness.category}</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.common.address}</p>
                    <p className="text-sm text-gray-600">{selectedBusiness.address}, {selectedBusiness.city}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.common.phone}</p>
                    <a href={`tel:${selectedBusiness.phone}`} className="text-sm text-orange-600 hover:underline">
                      {selectedBusiness.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.common.email}</p>
                    <a href={`mailto:${selectedBusiness.email}`} className="text-sm text-orange-600 hover:underline">
                      {selectedBusiness.email}
                    </a>
                  </div>
                </div>

                {selectedBusiness.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.common.website}</p>
                      <a href={selectedBusiness.website} target="_blank" rel="noopener noreferrer" className="text-sm text-orange-600 hover:underline">
                        {selectedBusiness.website}
                      </a>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t">
                  <p className="text-sm font-medium text-gray-900 mb-2">{t.common.description}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedBusiness.description}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
