import { useState } from 'react';
import { Star, Send, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/BoltDatabase';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';

interface AvisFormProps {
  sellerId: string;
  announcementId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AvisForm({ sellerId, announcementId, onSuccess, onCancel }: AvisFormProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [toastMessage, setToastMessage] = useState('');

  const showToastMessage = (type: 'success' | 'error', message: string) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      showToastMessage('error', 'Veuillez sélectionner une note');
      return;
    }

    if (!comment.trim()) {
      showToastMessage('error', t.avis.error.commentRequired);
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        showToastMessage('error', 'Vous devez être connecté pour laisser un avis');
        setLoading(false);
        return;
      }

      // Check if user already reviewed this announcement
      const { data: existingReview } = await supabase
        .from('avis_vendeur')
        .select('id')
        .eq('annonce_id', announcementId)
        .eq('evaluateur_email', user.email)
        .single();

      if (existingReview) {
        showToastMessage('error', 'Vous avez déjà laissé un avis pour cette annonce');
        setLoading(false);
        return;
      }

      // Check if user is not the seller
      if (user.email === sellerId) {
        showToastMessage('error', 'Vous ne pouvez pas noter votre propre annonce');
        setLoading(false);
        return;
      }

      // Préparer les données pour Supabase - STRICTE CORRESPONDANCE avec les colonnes
      const avisData = {
        annonce_id: announcementId,
        vendeur_email: sellerId,
        evaluateur_email: user.email || `user_${user.id}`,
        note: rating,
        commentaire: comment.trim()
      };

      // LOG DE DÉBOGAGE - Données prêtes pour Supabase
      console.log('=== DONNÉES PRÊTES POUR SUPABASE ===');
      console.log('Formulaire AvisForm - Avis Vendeur');
      console.log('Données formatées:', JSON.stringify(avisData, null, 2));
      console.log('Types des champs:');
      console.log('- annonce_id (uuid):', typeof avisData.annonce_id, avisData.annonce_id);
      console.log('- vendeur_email (string):', typeof avisData.vendeur_email, avisData.vendeur_email);
      console.log('- evaluateur_email (string):', typeof avisData.evaluateur_email, avisData.evaluateur_email);
      console.log('- note (number):', typeof avisData.note, avisData.note);
      console.log('- commentaire (string):', typeof avisData.commentaire, avisData.commentaire);
      console.log('=====================================');

      // Validation
      if (avisData.note < 1 || avisData.note > 5) {
        console.error('❌ ERREUR: La note doit être entre 1 et 5');
        showToastMessage('error', 'La note doit être entre 1 et 5');
        setLoading(false);
        return;
      }

      console.log('✅ Validation réussie. Envoi à Supabase...');

      // Insert review
      const { error: insertError } = await supabase
        .from('avis_vendeur')
        .insert([avisData]);

      if (insertError) {
        console.error('❌ ERREUR Supabase:', insertError);
        console.error('Code:', insertError.code);
        console.error('Message:', insertError.message);
        console.error('Details:', insertError.details);
        throw insertError;
      }

      console.log('✅ SUCCÈS: Avis vendeur créé dans Supabase');
      showToastMessage('success', 'Votre avis a été publié avec succès !');

      // Reset form
      setRating(0);
      setComment('');

      // Wait a bit before calling onSuccess to show the toast
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error: any) {
      console.error('❌ ERREUR INATTENDUE:', error);
      showToastMessage('error', t.common.error.occurred);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-transform hover:scale-125 focus:outline-none"
          >
            <Star
              className={`w-10 h-10 transition-colors ${
                star <= (hoverRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Votre note *
          </label>
          {renderStars()}
          {rating > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {rating === 1 && '⭐ Très mauvais'}
              {rating === 2 && '⭐⭐ Mauvais'}
              {rating === 3 && '⭐⭐⭐ Moyen'}
              {rating === 4 && '⭐⭐⭐⭐ Bon'}
              {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Votre commentaire *
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D62828] focus:ring-4 focus:ring-orange-100 outline-none transition-all resize-none"
            placeholder="Partagez votre expérience avec ce vendeur... (500 caractères max)"
            required
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {comment.length} / 500 caractères
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            disabled={loading}
          >
            <X className="w-5 h-5" />
            {t.common.cancel}
          </button>
          <button
            type="submit"
            disabled={loading || rating === 0 || !comment.trim()}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D62828] to-[#b91c1c] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Publication...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Publier l'avis
              </>
            )}
          </button>
        </div>
      </form>

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
