import { useState, useEffect } from 'react';
import { Star, MessageSquare, User, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '../lib/BoltDatabase';
import AvisForm from './AvisForm';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';

interface Avis {
  id: string;
  seller_id: string;
  rater_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface AvisSectionProps {
  sellerId: string;
  announcementId: string;
  onAvisSubmitted?: () => void;
}

export default function AvisSection({ sellerId, announcementId, onAvisSubmitted }: AvisSectionProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [avis, setAvis] = useState<Avis[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
    loadAvis();
    loadRatingAverage();
  }, [sellerId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const loadAvis = async () => {
    try {
      const { data, error } = await supabase
        .from('avis_vendeur')
        .select('*')
        .eq('vendeur_email', sellerId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        const formattedAvis = data.map(item => ({
          id: item.id,
          seller_id: item.vendeur_email,
          rater_id: item.evaluateur_email,
          rating: item.note,
          comment: item.commentaire || '',
          created_at: item.created_at
        }));
        setAvis(formattedAvis);
      }
    } catch (error) {
      console.error('Erreur chargement avis:', error);
    }
  };

  const loadRatingAverage = async () => {
    setLoading(true);
    try {
      const { data, error, count } = await supabase
        .from('avis_vendeur')
        .select('note', { count: 'exact' })
        .eq('vendeur_email', sellerId);

      if (!error && data) {
        const total = count || 0;
        if (total > 0) {
          const sum = data.reduce((acc, item) => acc + item.note, 0);
          setAverageRating(sum / total);
          setTotalReviews(total);
        } else {
          setAverageRating(0);
          setTotalReviews(0);
        }
      }
    } catch (error) {
      console.error('Erreur chargement moyenne:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvisSubmitted = () => {
    setShowForm(false);
    loadAvis();
    loadRatingAverage();
    if (onAvisSubmitted) {
      onAvisSubmitted();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#D62828] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header with Average Rating */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-[#D62828] mb-2">
                {averageRating > 0 ? averageRating.toFixed(1) : '-'}
              </div>
              {renderStars(Math.round(averageRating), 'lg')}
              <p className="text-sm text-gray-600 mt-2">
                {totalReviews} {totalReviews === 1 ? 'avis' : 'avis'}
              </p>
            </div>

            <div className="border-l border-gray-300 pl-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                Avis sur le vendeur
              </h3>
              <p className="text-gray-600">
                Découvrez les retours d'expérience des acheteurs
              </p>
            </div>
          </div>

          {isAuthenticated && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D62828] to-[#b91c1c] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              Laisser un avis
            </button>
          )}
        </div>
      </div>

      {/* Review Form */}
      {showForm && isAuthenticated && (
        <div className="border-b border-gray-200 bg-gray-50">
          <AvisForm
            sellerId={sellerId}
            announcementId={announcementId}
            onSuccess={handleAvisSubmitted}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Not Authenticated Message */}
      {!isAuthenticated && (
        <div className="p-6 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center gap-3 text-blue-700">
            <MessageSquare className="w-5 h-5" />
            <p className="font-medium">
              Connectez-vous pour laisser un avis sur ce vendeur
            </p>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="p-6">
        {avis.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">{t.avis.noReviews}</p>
            <p className="text-gray-400 text-sm mt-2">
              Soyez le premier à partager votre expérience
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {avis.map((review) => (
              <div
                key={review.id}
                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:border-orange-200 transition-all"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#D62828] to-[#b91c1c] rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Utilisateur vérifié</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(review.created_at)}
                      </div>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>

                {/* Review Comment */}
                {review.comment && (
                  <p className="text-gray-700 leading-relaxed pl-15">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
