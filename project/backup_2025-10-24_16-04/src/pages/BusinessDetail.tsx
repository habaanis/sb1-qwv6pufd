import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/BoltDatabase';
import { ArrowLeft, MapPin, Phone, Mail, Globe, Building, Star, Tag } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface BusinessDetailProps {
  businessId: string;
  onNavigateBack: () => void;
  onNavigateToBusiness?: (businessId: string) => void;
}

interface Business {
  id: string;
  nom: string;
  categories?: string;
  sous_categories?: string;
  ville: string;
  adresse: string;
  telephone: string;
  email: string;
  site_web?: string;
  description: string;
  latitude?: number;
  longitude?: number;
  tags?: string;
  created_at?: string;
  image_url?: string;
}

interface Review {
  id: string;
  entreprise_id: string;
  nom_utilisateur: string;
  commentaire: string;
  note: number;
  created_at: string;
}

export const BusinessDetail = ({ businessId, onNavigateBack, onNavigateToBusiness }: BusinessDetailProps) => {
  const { language } = useLanguage();
  const [business, setBusiness] = useState<Business | null>(null);
  const [similarBusinesses, setSimilarBusinesses] = useState<Business[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchBusiness = async () => {
      setLoading(true);
      setError(false);

      try {
        const { data, error } = await supabase
          .from('entreprise')
          .select('*')
          .eq('id', businessId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setBusiness(data as Business);

          let similar: any[] = [];
          if (data.ville && data.categories) {
            const { data: similarData, error: similarError } = await supabase
              .from('entreprise')
              .select('id, nom, categories, sous_categories, ville, description, image_url')
              .eq('ville', data.ville)
              .eq('categories', data.categories)
              .neq('id', data.id)
              .limit(5);

            if (!similarError && similarData && similarData.length > 0) {
              similar = similarData;
            } else {
              const { data: fallbackData } = await supabase
                .from('entreprise')
                .select('id, nom, categories, sous_categories, ville, description, image_url')
                .neq('id', data.id)
                .limit(5);

              similar = fallbackData || [];
            }
          } else {
            const { data: fallbackData } = await supabase
              .from('entreprise')
              .select('id, nom, categories, sous_categories, ville, description, image_url')
              .neq('id', data.id)
              .limit(5);

            similar = fallbackData || [];
          }

          setSimilarBusinesses(similar as Business[]);

          const { data: reviewsData, error: reviewsError } = await supabase
            .from('avis_entreprise')
            .select('*')
            .eq('entreprise_id', data.id)
            .order('created_at', { ascending: false });

          if (!reviewsError && reviewsData) {
            setReviews(reviewsData as Review[]);
            if (reviewsData.length > 0) {
              const total = reviewsData.reduce((sum: number, r: any) => sum + r.note, 0);
              setAverageRating(parseFloat((total / reviewsData.length).toFixed(1)));
            }
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching business:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [businessId]);

  const fetchReviews = async () => {
    try {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('avis_entreprise')
        .select('*')
        .eq('entreprise_id', businessId)
        .order('created_at', { ascending: false });

      if (!reviewsError && reviewsData) {
        setReviews(reviewsData as Review[]);
        if (reviewsData.length > 0) {
          const total = reviewsData.reduce((sum: number, r: any) => sum + r.note, 0);
          setAverageRating(parseFloat((total / reviewsData.length).toFixed(1)));
        } else {
          setAverageRating(null);
        }
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const { error } = await supabase.from('avis_entreprise').insert([
        {
          entreprise_id: businessId,
          nom_utilisateur: reviewName,
          commentaire: reviewComment,
          note: reviewRating,
        },
      ]);

      if (!error) {
        setReviewName('');
        setReviewComment('');
        setReviewRating(5);
        await fetchReviews();
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const translations = {
    fr: {
      loading: 'Chargement...',
      notFound: 'Entreprise introuvable.',
      backToSearch: 'Retour à la recherche',
      category: 'Catégorie',
      subCategory: 'Sous-catégorie',
      city: 'Ville',
      address: 'Adresse',
      phone: 'Téléphone',
      email: 'Email',
      website: 'Site web',
      description: 'Description',
      tags: 'Tags',
      memberSince: 'Membre depuis le',
      location: 'Localisation',
      contact: 'Coordonnées',
      similarTitle: 'Entreprises similaires à',
      viewDetails: 'Voir la fiche',
      noSimilar: 'Aucune entreprise similaire trouvée.',
      reviewsTitle: 'Avis et notes',
      averageRating: 'Note moyenne',
      reviewsCount: 'avis',
      leaveReview: 'Laisser un avis',
      yourName: 'Votre nom',
      yourReview: 'Votre avis',
      rating: 'Note (1 à 5 étoiles)',
      submitReview: 'Publier l\'avis',
      submitting: 'Publication...',
    },
    en: {
      loading: 'Loading...',
      notFound: 'Business not found.',
      backToSearch: 'Back to search',
      category: 'Category',
      subCategory: 'Subcategory',
      city: 'City',
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      website: 'Website',
      description: 'Description',
      tags: 'Tags',
      memberSince: 'Member since',
      location: 'Location',
      contact: 'Contact Information',
      similarTitle: 'Similar businesses to',
      viewDetails: 'View details',
      noSimilar: 'No similar businesses found.',
      reviewsTitle: 'Reviews & Ratings',
      averageRating: 'Average rating',
      reviewsCount: 'reviews',
      leaveReview: 'Leave a review',
      yourName: 'Your name',
      yourReview: 'Your review',
      rating: 'Rating (1 to 5 stars)',
      submitReview: 'Submit',
      submitting: 'Submitting...',
    },
    ar: {
      loading: 'جارٍ التحميل...',
      notFound: 'الشركة غير موجودة.',
      backToSearch: 'العودة إلى البحث',
      category: 'الفئة',
      subCategory: 'الفئة الفرعية',
      city: 'المدينة',
      address: 'العنوان',
      phone: 'الهاتف',
      email: 'البريد الإلكتروني',
      website: 'الموقع الإلكتروني',
      description: 'الوصف',
      tags: 'الكلمات المفتاحية',
      memberSince: 'عضو منذ',
      location: 'الموقع',
      contact: 'معلومات الاتصال',
      similarTitle: 'شركات مشابهة لـ',
      viewDetails: 'عرض الملف',
      noSimilar: 'لم يتم العثور على شركات مشابهة.',
      reviewsTitle: 'التقييمات والمراجعات',
      averageRating: 'التقييم العام',
      reviewsCount: 'تقييم',
      leaveReview: 'أضف مراجعة',
      yourName: 'اسمك',
      yourReview: 'رأيك',
      rating: 'التقييم (من 1 إلى 5)',
      submitReview: 'نشر التقييم',
      submitting: 'جارٍ النشر...',
    },
    it: {
      loading: 'Caricamento...',
      notFound: 'Impresa non trovata.',
      backToSearch: 'Torna alla ricerca',
      category: 'Categoria',
      subCategory: 'Sottocategoria',
      city: 'Città',
      address: 'Indirizzo',
      phone: 'Telefono',
      email: 'Email',
      website: 'Sito web',
      description: 'Descrizione',
      tags: 'Tag',
      memberSince: 'Membro dal',
      location: 'Posizione',
      contact: 'Informazioni di contatto',
      similarTitle: 'Aziende simili a',
      viewDetails: 'Vedi la scheda',
      noSimilar: 'Nessuna azienda simile trovata.',
      reviewsTitle: 'Recensioni e valutazioni',
      averageRating: 'Valutazione media',
      reviewsCount: 'recensioni',
      leaveReview: 'Lascia una recensione',
      yourName: 'Il tuo nome',
      yourReview: 'La tua opinione',
      rating: 'Voto (da 1 a 5)',
      submitReview: 'Pubblica',
      submitting: 'Pubblicazione...',
    },
    ru: {
      loading: 'Загрузка...',
      notFound: 'Компания не найдена.',
      backToSearch: 'Вернуться к поиску',
      category: 'Категория',
      subCategory: 'Подкатегория',
      city: 'Город',
      address: 'Адрес',
      phone: 'Телефон',
      email: 'Электронная почта',
      website: 'Веб-сайт',
      description: 'Описание',
      tags: 'Теги',
      memberSince: 'Участник с',
      location: 'Расположение',
      contact: 'Контактная информация',
      similarTitle: 'Похожие компании на',
      viewDetails: 'Подробнее',
      noSimilar: 'Похожие компании не найдены.',
      reviewsTitle: 'Отзывы и оценки',
      averageRating: 'Средняя оценка',
      reviewsCount: 'отзывов',
      leaveReview: 'Оставить отзыв',
      yourName: 'Ваше имя',
      yourReview: 'Ваш отзыв',
      rating: 'Оценка (1–5)',
      submitReview: 'Опубликовать',
      submitting: 'Публикация...',
    },
  };

  const text = translations[language as keyof typeof translations] || translations.fr;
  const isRTL = language === 'ar';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">{text.loading}</p>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg mb-6">{text.notFound}</p>
        <button
          onClick={onNavigateBack}
          className="flex items-center gap-2 px-6 py-3 bg-[#D62828] text-white rounded-3xl hover:bg-[#b91c1c] transition-all"
        >
          <ArrowLeft size={20} />
          {text.backToSearch}
        </button>
      </div>
    );
  }

  return (
    <div className="py-10 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onNavigateBack}
          className="flex items-center gap-2 mb-6 text-[#D62828] hover:text-[#b91c1c] transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          {text.backToSearch}
        </button>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="bg-gradient-to-r from-[#D62828]/5 to-amber-50/50 p-8">
            <div className="flex flex-col items-center text-center">
              {business.image_url && (
                <img
                  src={business.image_url}
                  alt={business.nom}
                  className="w-32 h-32 object-cover rounded-full shadow-md mb-4 ring-4 ring-white"
                />
              )}
              {!business.image_url && (
                <div className="w-32 h-32 flex items-center justify-center bg-white rounded-full shadow-md mb-4 ring-4 ring-white">
                  <Building size={48} className="text-[#D62828]" />
                </div>
              )}
              <h1 className="text-4xl font-bold text-[#D62828] mb-3">{business.nom}</h1>
              <p className="text-gray-700 text-lg font-medium">
                {business.categories}
                {business.categories && business.sous_categories && ' • '}
                {business.sous_categories}
              </p>
              {business.created_at && (
                <p className="text-sm text-gray-500 mt-2">
                  {text.memberSince} {new Date(business.created_at).toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-TN' : language === 'it' ? 'it-IT' : language === 'ru' ? 'ru-RU' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
            </div>
          </div>

          <div className="p-8">
            {business.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">{text.description}</h2>
                <p className="text-gray-700 leading-relaxed">{business.description}</p>
              </div>
            )}

            {business.tags && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={20} className="text-[#D62828]" />
                  <h2 className="text-xl font-semibold text-gray-800">{text.tags}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {business.tags.split(',').map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-4 py-2 bg-[#D62828]/10 text-[#D62828] rounded-full text-sm font-medium hover:bg-[#D62828]/20 transition-colors"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{text.contact}</h2>
              <div className="bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/50 transition-colors">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#D62828]/10 rounded-full flex-shrink-0">
                    <MapPin size={20} className="text-[#D62828]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">{text.city}</p>
                    <p className="text-gray-800 font-medium">{business.ville}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/50 transition-colors">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#D62828]/10 rounded-full flex-shrink-0">
                    <Building size={20} className="text-[#D62828]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">{text.address}</p>
                    <p className="text-gray-800 font-medium">{business.adresse}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/50 transition-colors">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#D62828]/10 rounded-full flex-shrink-0">
                    <Phone size={20} className="text-[#D62828]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">{text.phone}</p>
                    <a
                      href={`tel:${business.telephone}`}
                      className="text-[#D62828] font-medium hover:underline"
                    >
                      {business.telephone}
                    </a>
                  </div>
                </div>

                {business.email && (
                  <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/50 transition-colors">
                    <div className="w-10 h-10 flex items-center justify-center bg-[#D62828]/10 rounded-full flex-shrink-0">
                      <Mail size={20} className="text-[#D62828]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">{text.email}</p>
                      <a
                        href={`mailto:${business.email}`}
                        className="text-[#D62828] font-medium hover:underline break-all"
                      >
                        {business.email}
                      </a>
                    </div>
                  </div>
                )}

                {business.site_web && (
                  <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/50 transition-colors">
                    <div className="w-10 h-10 flex items-center justify-center bg-[#D62828]/10 rounded-full flex-shrink-0">
                      <Globe size={20} className="text-[#D62828]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">{text.website}</p>
                      <a
                        href={business.site_web.startsWith('http') ? business.site_web : `https://${business.site_web}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#D62828] font-medium hover:underline break-all"
                      >
                        {business.site_web}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {business.latitude && business.longitude && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={20} className="text-[#D62828]" />
                  <h2 className="text-xl font-semibold text-gray-800">{text.location}</h2>
                </div>
                <div className="rounded-2xl overflow-hidden shadow-md" style={{ height: '320px' }}>
                  <MapContainer
                    center={[business.latitude, business.longitude]}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[business.latitude, business.longitude]}>
                      <Popup>
                        <div className="text-center">
                          <p className="font-semibold text-[#D62828]">{business.nom}</p>
                          <p className="text-sm text-gray-600">{business.adresse}</p>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}

            <div className="text-center pt-4">
              <button
                onClick={onNavigateBack}
                className="inline-flex items-center gap-2 bg-[#D62828] text-white px-8 py-3 rounded-3xl hover:bg-[#b91c1c] transition-all shadow-md font-medium"
              >
                <ArrowLeft size={20} />
                {text.backToSearch}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <h2 className="text-xl font-semibold text-[#D62828] mb-6">
            {text.similarTitle} "{business.nom}"
          </h2>
          {similarBusinesses.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-5">
              {similarBusinesses.map((s) => (
                <div
                  key={s.id}
                  className="flex items-start gap-4 p-3 rounded-2xl hover:bg-[#fdf3f3] transition cursor-pointer"
                  onClick={() => onNavigateToBusiness?.(s.id)}
                >
                  {s.image_url ? (
                    <img
                      src={s.image_url}
                      alt={s.nom}
                      className="w-16 h-16 object-cover rounded-full shadow-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 rounded-full shadow-sm flex-shrink-0">
                      <Building size={24} className="text-[#D62828]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-[#D62828] truncate">{s.nom}</h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {s.categories}
                      {s.categories && s.sous_categories && ' / '}
                      {s.sous_categories} — {s.ville}
                    </p>
                    {s.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">{s.description}</p>
                    )}
                    <span className="text-[#D62828] text-sm font-medium hover:underline inline-block">
                      {text.viewDetails} →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">{text.noSimilar}</p>
          )}
        </div>

        <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-6">
          <h2 className="text-xl font-semibold text-[#D62828] mb-6">{text.reviewsTitle}</h2>

          {averageRating !== null && (
            <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className={star <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <p className="text-gray-700">
                <span className="font-semibold text-[#D62828]">{averageRating}/5</span> ({reviews.length} {text.reviewsCount})
              </p>
            </div>
          )}

          {reviews.length > 0 && (
            <div className="divide-y divide-gray-100 mb-8">
              {reviews.map((review) => (
                <div key={review.id} className="py-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-[#D62828]">{review.nom_utilisateur}</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={star <= review.note ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{review.commentaire}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(review.created_at).toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-TN' : language === 'it' ? 'it-IT' : language === 'ru' ? 'ru-RU' : 'en-US')}
                  </p>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">{text.leaveReview}</h3>

            <div>
              <input
                type="text"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                placeholder={text.yourName}
                className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-gray-200 focus:ring-2 focus:ring-[#D62828] focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={text.yourReview}
                rows={4}
                className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-gray-200 focus:ring-2 focus:ring-[#D62828] focus:border-transparent outline-none transition resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{text.rating}</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      className={star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}
                    />
                  </button>
                ))}
                <span className="ml-2 text-gray-600 font-medium">{reviewRating}/5</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="bg-[#D62828] text-white px-8 py-3 rounded-3xl hover:bg-[#b91c1c] transition-all shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingReview ? text.submitting : text.submitReview}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
