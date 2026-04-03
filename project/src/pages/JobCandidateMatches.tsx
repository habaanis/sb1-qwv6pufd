import React, { useState, useEffect } from 'react';
import { Users, MapPin, Award, TrendingUp, Mail, ArrowLeft, Loader2, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import PremiumWrapper, { PremiumBadge } from '../components/PremiumWrapper';

interface CandidateMatch {
  candidate_id: string;
  full_name: string;
  city: string;
  category: string;
  skills: string[];
  experience_years: number;
  score: number;
  reason: string;
  is_premium?: boolean;
}

interface JobCandidateMatchesProps {
  jobId: string;
}

export default function JobCandidateMatches({ jobId }: JobCandidateMatchesProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<CandidateMatch[]>([]);
  const [jobTitle, setJobTitle] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState<CandidateMatch | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadMatches();
  }, [jobId]);

  async function loadMatches() {
    try {
      setLoading(true);
      setError(null);

      // Vérifier que l'offre appartient à l'utilisateur
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Vous devez être connecté pour voir les candidats');
        return;
      }

      const { data: job, error: jobError } = await supabase
        .from('job_postings')
        .select('title, created_by')
        .eq('id', jobId)
        .maybeSingle();

      if (jobError) {
        console.error('[JobCandidateMatches] Error fetching job:', jobError);
        throw jobError;
      }

      if (!job) {
        setError('Offre d\'emploi non trouvée');
        return;
      }

      if (job.created_by !== user.id) {
        setError('Vous n\'avez pas accès aux candidats de cette offre');
        return;
      }

      setJobTitle(job.title);

      // Appeler la RPC match_candidates_for_job
      const { data, error: matchError } = await supabase.rpc('match_candidates_for_job', {
        p_job_id: jobId,
        p_limit: 20,
        p_offset: 0
      });

      if (matchError) {
        console.error('[JobCandidateMatches] Error fetching matches:', matchError);
        throw matchError;
      }

      setMatches(data || []);
    } catch (err: any) {
      console.error('[JobCandidateMatches] Unexpected error:', err);
      setError(err.message || 'Erreur lors du chargement des candidats');
    } finally {
      setLoading(false);
    }
  }

  function handleContact(candidate: CandidateMatch) {
    setShowContactForm(candidate);
    setContactMessage(`Bonjour ${candidate.full_name},\n\nJe vous contacte concernant notre offre "${jobTitle}".\n\nVotre profil correspond parfaitement à ce que nous recherchons.\n\nSeriez-vous disponible pour en discuter ?\n\nCordialement`);
  }

  async function handleSendMessage() {
    if (!showContactForm) return;

    setSending(true);
    try {
      // Simuler l'envoi (à implémenter plus tard avec un vrai système de messaging)
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('[JobCandidateMatches] Message envoyé à:', showContactForm.candidate_id);
      console.log('[JobCandidateMatches] Message:', contactMessage);

      alert('Fonctionnalité de messagerie en cours de développement. Le candidat sera notifié prochainement.');
      setShowContactForm(null);
      setContactMessage('');
    } catch (err) {
      console.error('[JobCandidateMatches] Error sending message:', err);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 50) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getExperienceLabel = (years: number) => {
    if (years === 0) return 'Débutant';
    if (years === 1) return '1 an d\'expérience';
    return `${years} ans d'expérience`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Recherche des candidats correspondants...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={() => window.history.back()}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg">
            <h3 className="font-bold mb-2">Erreur</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => window.history.back()}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour à l'offre
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Users className="w-10 h-10 text-orange-600" />
            Candidats correspondants
          </h1>
          <p className="text-lg text-gray-600">
            Pour l'offre : <span className="font-semibold">{jobTitle}</span>
          </p>
        </div>

        {/* Liste des candidats */}
        {matches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Aucun candidat correspondant pour le moment
            </h3>
            <p className="text-gray-600">
              Les candidats dont le profil correspond apparaîtront ici automatiquement.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {matches.map((match) => (
              <PremiumWrapper
                key={match.candidate_id}
                isPremium={match.is_premium || false}
                variant="card"
                showBadge={true}
                badgePosition="top-right"
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 p-6"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Infos principales */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {match.full_name}
                        </h3>
                        {match.is_premium && (
                          <PremiumBadge size="md" />
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold border ${getScoreColor(match.score)}`}
                        title={match.reason}
                      >
                        Match {match.score}%
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>{match.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-600" />
                        <span>{getExperienceLabel(match.experience_years)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="capitalize">{match.category}</span>
                      </div>
                    </div>

                    {/* Raison du match */}
                    {match.reason && (
                      <div className="mb-3 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <span className="font-medium text-blue-900">Pourquoi ce candidat ? </span>
                        {match.reason}
                      </div>
                    )}

                    {/* Compétences */}
                    {match.skills && match.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {match.skills.slice(0, 10).map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200"
                          >
                            {skill}
                          </span>
                        ))}
                        {match.skills.length > 10 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            +{match.skills.length - 10}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 lg:w-48">
                    <button
                      onClick={() => handleContact(match)}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Contacter</span>
                    </button>
                  </div>
                </div>
              </PremiumWrapper>
            ))}
          </div>
        )}

        {/* Modal de contact */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">
                  Contacter {showContactForm.full_name}
                </h3>
                <button
                  onClick={() => setShowContactForm(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Note :</strong> Cette fonctionnalité de messagerie est en cours de développement.
                  Pour le moment, le message sera simulé.
                </p>

                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[200px]"
                  placeholder="Votre message..."
                />

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setShowContactForm(null)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !contactMessage.trim()}
                    className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Envoi...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Envoyer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
