import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Tag, Calendar, Phone, Share2, Flag, DollarSign, Heart, Star, TrendingUp, Zap, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/BoltDatabase';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import NegotiationModal from './NegotiationModal';
import ReportModal from './ReportModal';
import AvisSection from './AvisSection';
import { getSupabaseImageUrl } from '../lib/imageUtils';
import { Toast } from './Toast';

interface AnnouncementDetailProps {
  announcementId: string;
  onClose: () => void;
}

interface Announcement {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  contact_tel: string;
  photo_url: string[];
  category: string;
  type_annonce: string;
  date_publication: string;
  urgent: boolean;
  vendeur_badge: string;
  vendeur_note: number;
  vues: number;
  user_email: string;
}

export default function AnnouncementDetail({ announcementId, onClose }: AnnouncementDetailProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadAnnouncement();
    incrementViews();
    checkOwnership();
  }, [announcementId]);

  const showToastMessage = (type: 'success' | 'error', message: string) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const checkOwnership = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: annonce } = await supabase
        .from('v_annonces_visibles')
        .select('user_email')
        .eq('id', announcementId)
        .single();

      if (user && annonce && user.email === annonce.user_email) {
        setIsOwner(true);
      }
    } catch (error) {
      console.error('Erreur vérification propriétaire:', error);
    }
  };

  const loadAnnouncement = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('v_annonces_visibles')
        .select('*')
        .eq('id', announcementId)
        .single();

      if (!error && data) {
        setAnnouncement(data);
      }
    } catch (error) {
      console.error('Erreur chargement annonce:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      await supabase.rpc('increment_annonce_views', { annonce_id: announcementId });
    } catch (error) {
      console.error('Erreur incrémentation vues:', error);
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = announcement ? `${announcement.title} - ${announcement.price} TND` : '';

    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      default:
        navigator.clipboard.writeText(url);
        setToastMessage('Lien copié !');
        setToastType('success');
        setShowToast(true);
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Il y a moins d\'une heure';
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const nextImage = () => {
    if (announcement && announcement.photo_url.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % announcement.photo_url.length);
    }
  };

  const prevImage = () => {
    if (announcement && announcement.photo_url.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + announcement.photo_url.length) % announcement.photo_url.length);
    }
  };

  const toggleFavorite = async () => {
    try {
      const userIdentifier = localStorage.getItem('user_id') || `guest_${Date.now()}`;
      const { data } = await supabase.rpc('toggle_favorite', {
        annonce_id: announcementId,
        user_identifier: userIdentifier
      });
      setIsFavorited(data);
    } catch (error) {
      console.error('Erreur favoris:', error);
    }
  };

  const handleBumpAnnonce = async () => {
    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToastMessage('error', 'Vous devez être connecté');
        setActionLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('free_bump_annonce', {
        p_annonce_id: announcementId,
        p_user_id: user.id
      });

      if (error) throw error;

      const result = data as any;
      if (result.success) {
        showToastMessage('success', result.message);
        setTimeout(() => {
          loadAnnouncement();
        }, 1500);
      } else {
        if (result.hours_remaining) {
          showToastMessage('error', `${result.message} : ${result.hours_remaining}h restantes`);
        } else {
          showToastMessage('error', result.message);
        }
      }
    } catch (error: any) {
      console.error('Erreur bump:', error);
      showToastMessage('error', 'Une erreur est survenue');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUrgent = async () => {
    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToastMessage('error', 'Vous devez être connecté');
        setActionLoading(false);
        return;
      }

      const newUrgentValue = !announcement?.urgent;

      const { data, error } = await supabase.rpc('free_set_urgent', {
        p_annonce_id: announcementId,
        p_user_id: user.id,
        p_value: newUrgentValue
      });

      if (error) throw error;

      const result = data as any;
      if (result.success) {
        showToastMessage('success', result.message);
        setTimeout(() => {
          loadAnnouncement();
        }, 1500);
      } else {
        if (result.hours_remaining) {
          showToastMessage('error', `${result.message} : ${result.hours_remaining}h restantes`);
        } else {
          showToastMessage('error', result.message);
        }
      }
    } catch (error: any) {
      console.error('Erreur urgent:', error);
      showToastMessage('error', 'Une erreur est survenue');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="w-16 h-16 border-4 border-[#D62828] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return null;
  }

  const hasImages = announcement.photo_url && announcement.photo_url.length > 0;

  return (
    <>
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              {announcement.urgent && (
                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                  🔥 URGENT
                </span>
              )}
              <h2 className="text-xl font-bold text-gray-900">{announcement.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Image Carousel */}
          {hasImages && (
            <div className="relative h-96 bg-gray-100">
              <img
                src={getSupabaseImageUrl(announcement.photo_url[currentImageIndex])}
                alt={announcement.title}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('placeholder.jpg')) {
                    target.src = '/images/placeholder.jpg';
                  }
                }}
              />

              {announcement.photo_url.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* Image indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {announcement.photo_url.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Price & Actions */}
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold text-[#D62828]">
                {announcement.price > 0 ? (
                  <>{announcement.price.toLocaleString('fr-FR')} <span className="text-xl">TND</span></>
                ) : (
                  <span className="text-2xl text-gray-600">Prix à négocier</span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={toggleFavorite}
                  className={`p-3 rounded-full transition-all ${
                    isFavorited ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="p-3 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="p-3 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Seller Badge */}
            {announcement.vendeur_badge && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl">
                <div className="flex items-center gap-2">
                  {announcement.vendeur_badge === 'top_vendeur' && (
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" />
                      Top Vendeur
                    </span>
                  )}
                  {announcement.vendeur_badge === 'verifie' && (
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                      ✓ Vérifié
                    </span>
                  )}
                  {announcement.vendeur_note > 0 && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-bold">{announcement.vendeur_note.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                <MapPin className="w-5 h-5 text-[#D62828]" />
                <div>
                  <p className="text-xs text-gray-500">{t.common.fields.locationLabel}</p>
                  <p className="font-semibold">{announcement.city}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                <Tag className="w-5 h-5 text-[#D62828]" />
                <div>
                  <p className="text-xs text-gray-500">Catégorie</p>
                  <p className="font-semibold">{announcement.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                <Calendar className="w-5 h-5 text-[#D62828]" />
                <div>
                  <p className="text-xs text-gray-500">Publié</p>
                  <p className="font-semibold">{formatDate(announcement.date_publication)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                <span className="text-[#D62828] text-xl">👁️</span>
                <div>
                  <p className="text-xs text-gray-500">Vues</p>
                  <p className="font-semibold">{announcement.vues}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100">
              <h3 className="font-bold text-lg mb-3">{t.common.fields.descriptionLabel}</h3>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {announcement.description}
              </p>
            </div>

            {/* Seller Actions (if owner) */}
            {isOwner && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-200">
                <h3 className="font-bold text-lg mb-4 text-purple-900 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Actions vendeur
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleBumpAnnonce}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <TrendingUp className="w-5 h-5" />
                    {actionLoading ? 'Traitement...' : 'Remonter l\'annonce'}
                  </button>

                  <button
                    onClick={handleToggleUrgent}
                    disabled={actionLoading}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      announcement.urgent
                        ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                        : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                    }`}
                  >
                    <Zap className="w-5 h-5" />
                    {actionLoading ? 'Traitement...' : announcement.urgent ? 'Désactiver URGENT' : 'Activer URGENT'}
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-3 text-center">
                  Actions gratuites avec cooldown : Remonter (7 jours) • URGENT (3 jours)
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {!isOwner && (
              <>
                {/* WhatsApp Contact Button - Primary CTA */}
                <div className="pt-4 border-t border-gray-200">
                  <a
                    href={`https://wa.me/${announcement.contact_tel.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour, je suis intéressé par votre annonce : ${announcement.title} (${announcement.price} TND)`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white px-6 py-5 rounded-xl font-bold hover:shadow-xl transition-all w-full text-lg"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Contacter le Vendeur via WhatsApp
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <button
                    onClick={() => window.location.href = `tel:${announcement.contact_tel}`}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#D62828] to-[#b91c1c] text-white px-6 py-4 rounded-xl font-bold hover:shadow-xl transition-all"
                  >
                    <Phone className="w-5 h-5" />
                    Appeler
                  </button>

                  <button
                    onClick={() => setShowNegotiation(true)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl font-bold hover:shadow-xl transition-all"
                  >
                    <DollarSign className="w-5 h-5" />
                    Faire une offre
                  </button>

                  <button
                    onClick={() => setShowReport(true)}
                    className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                  >
                    <Flag className="w-5 h-5" />
                    Signaler
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Reviews Section */}
          <div className="p-6 bg-gray-50">
            <AvisSection
              sellerId={announcement.user_email}
              announcementId={announcement.id}
              onAvisSubmitted={loadAnnouncement}
            />
          </div>
        </div>
      </div>

      {showNegotiation && (
        <NegotiationModal
          announcementId={announcementId}
          currentPrice={announcement.price}
          onClose={() => setShowNegotiation(false)}
        />
      )}

      {showReport && (
        <ReportModal
          announcementId={announcementId}
          onClose={() => setShowReport(false)}
        />
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-[100] animate-slide-up">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl ${
              toastType === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {toastType === 'success' ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <AlertCircle className="w-6 h-6" />
            )}
            <p className="font-semibold">{toastMessage}</p>
          </div>
        </div>
      )}
    </>
  );
}
