import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/BoltDatabase';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';

type Rating = 'positif' | 'neutre' | 'negatif' | null;

export default function HomeFeedbackWidget() {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [selectedRating, setSelectedRating] = useState<Rating>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedRating) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('feedback_home')
        .insert({
          rating: selectedRating,
          comment: comment.trim() || null,
          page: 'home',
          user_ip: null,
          user_agent: null
        });

      if (insertError) {
        console.error('Error inserting feedback:', insertError);
        setError('Une erreur est survenue, merci de réessayer.');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitted(true);
      setSelectedRating(null);
      setComment('');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Une erreur est survenue, merci de réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-gradient-to-br from-[#4A1D43]/5 to-[#D4AF37]/10 rounded-xl p-5 border border-[#D4AF37] text-center">
        <CheckCircle className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Merci pour votre avis !</h3>
        <p className="text-sm text-gray-600">Votre retour nous aide à améliorer Dalil Tounes.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#FAF8F3] to-white rounded-xl shadow-md p-4 border border-[#D4AF37] relative z-[100] pointer-events-auto">
      <div className="flex flex-col items-center justify-center gap-3 mb-4 relative z-[110] pointer-events-auto">
        <h3 className="text-base font-semibold text-gray-900 text-center">
          {t.home.feedbackQuestion}
        </h3>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setSelectedRating('positif')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              selectedRating === 'positif'
                ? 'bg-green-100 border border-green-500'
                : 'bg-gray-50 border border-gray-200 hover:bg-green-50 hover:border-green-300'
            }`}
          >
            <span className="text-2xl">🙂</span>
            <span className="text-xs font-medium text-gray-700">{t.feedback.positive}</span>
          </button>

          <button
            onClick={() => setSelectedRating('neutre')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              selectedRating === 'neutre'
                ? 'bg-yellow-100 border border-yellow-500'
                : 'bg-gray-50 border border-gray-200 hover:bg-yellow-50 hover:border-yellow-300'
            }`}
          >
            <span className="text-2xl">😐</span>
            <span className="text-xs font-medium text-gray-700">{t.feedback.neutral}</span>
          </button>

          <button
            onClick={() => setSelectedRating('negatif')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              selectedRating === 'negatif'
                ? 'bg-red-100 border border-red-500'
                : 'bg-gray-50 border border-gray-200 hover:bg-red-50 hover:border-red-300'
            }`}
          >
            <span className="text-2xl">😞</span>
            <span className="text-xs font-medium text-gray-700">{t.feedback.negative}</span>
          </button>
        </div>
      </div>

      <div className="mb-3 relative z-[115]">
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Une remarque à nous partager ? (optionnel)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          placeholder="Dites-nous ce qui vous plaît ou ce qui pourrait être amélioré..."
          className="w-full px-3 py-2 border border-[#D4AF37] rounded-lg focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all resize-none text-sm text-gray-900 relative z-[116]"
        />
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        id="submit-feedback"
        className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#4A1D43] hover:bg-[#5A2D53] text-[#D4AF37] border-2 border-[#D4AF37] rounded-xl hover:shadow-[0_6px_25px_rgba(212,175,55,0.5)] transition-all font-bold text-sm relative z-[120] cursor-pointer hover:scale-105 pointer-events-auto touch-auto"
        type="button"
        style={{ pointerEvents: 'auto' }}
      >
        <Send className="w-4 h-4" />
        {isSubmitting ? 'Envoi en cours...' : 'Envoyer mon avis'}
      </button>
    </div>
  );
}
