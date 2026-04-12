import { useState } from 'react';
import { X, Flag, Loader2 } from 'lucide-react';
import { supabase } from '../lib/BoltDatabase';

interface ReportModalProps {
  announcementId: string;
  onClose: () => void;
}

const REPORT_REASONS = [
  { value: 'arnaque', label: '🚫 Arnaque / Fraude' },
  { value: 'contenu_illegal', label: '⚠️ Contenu illégal' },
  { value: 'fausse_annonce', label: '❌ Fausse annonce' },
  { value: 'prix_abusif', label: '💰 Prix abusif' },
  { value: 'contenu_inapproprie', label: '🔞 Contenu inapproprié' },
  { value: 'doublon', label: '📋 Annonce en doublon' },
  { value: 'autre', label: '❓ Autre raison' }
];

export default function ReportModal({ announcementId, onClose }: ReportModalProps) {
  const [motif, setMotif] = useState('');
  const [description, setDescription] = useState('');
  const [signalePar, setSignalePar] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!motif) {
      setError('Veuillez sélectionner un motif');
      return;
    }

    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('annonces_signales')
        .insert([{
          annonce_id: announcementId,
          motif: motif,
          description: description,
          signale_par: signalePar || 'Anonyme'
        }]);

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Erreur signalement:', err);
      setError(t.common.error.occurred);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Flag className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Signaler cette annonce</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Signalement envoyé !</h3>
              <p className="text-gray-600">Merci pour votre contribution. Nous allons examiner cette annonce rapidement.</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl">
                <p className="text-sm font-semibold text-gray-700 mb-2">⚠️ Attention</p>
                <p className="text-sm text-gray-600">
                  Les faux signalements peuvent entraîner des sanctions. Veuillez signaler uniquement les annonces qui violent nos règles.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Motif du signalement *
                </label>
                <div className="space-y-2">
                  {REPORT_REASONS.map((reason) => (
                    <label
                      key={reason.value}
                      className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[#D62828] transition-all"
                    >
                      <input
                        type="radio"
                        name="motif"
                        value={reason.value}
                        checked={motif === reason.value}
                        onChange={(e) => setMotif(e.target.value)}
                        className="w-5 h-5 text-[#D62828] focus:ring-[#D62828]"
                      />
                      <span className="font-medium">{reason.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description détaillée (optionnel)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D62828] focus:ring-4 focus:ring-orange-100 outline-none transition-all resize-none"
                  placeholder="Donnez plus de détails sur le problème..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Votre email (optionnel)
                </label>
                <input
                  type="email"
                  value={signalePar}
                  onChange={(e) => setSignalePar(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D62828] focus:ring-4 focus:ring-orange-100 outline-none transition-all"
                  placeholder="Pour vous tenir informé"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Facultatif. Nous pourrons vous contacter si nécessaire.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 font-semibold hover:bg-gray-50 transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Flag className="w-5 h-5" />
                      Signaler
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
