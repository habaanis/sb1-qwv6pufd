import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Building2, Clock, Award, TrendingUp, Send, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';

interface JobMatch {
  job_id: string;
  title: string;
  company: string;
  city: string;
  category: string;
  contract_type: string;
  seniority: string;
  skills: string[];
  salary_min: number | null;
  salary_max: number | null;
  score: number;
  reason: string;
}

export default function CandidateJobMatches() {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    try {
      setLoading(true);
      setError(null);

      // Récupérer le candidate_id de l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Vous devez être connecté pour voir vos recommandations');
        return;
      }

      const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .select('id')
        .eq('created_by', user.id)
        .maybeSingle();

      if (candidateError) {
        console.error('[CandidateJobMatches] Error fetching candidate:', candidateError);
        throw candidateError;
      }

      if (!candidate) {
        setError('Aucun profil candidat trouvé. Veuillez créer votre profil candidat d\'abord.');
        return;
      }

      setCandidateId(candidate.id);

      // Appeler la RPC match_jobs_for_candidate
      const { data, error: matchError } = await supabase.rpc('match_jobs_for_candidate', {
        p_candidate_id: candidate.id,
        p_limit: 20,
        p_offset: 0
      });

      if (matchError) {
        console.error('[CandidateJobMatches] Error fetching matches:', matchError);
        throw matchError;
      }

      setMatches(data || []);
    } catch (err: any) {
      console.error('[CandidateJobMatches] Unexpected error:', err);
      setError(err.message || 'Erreur lors du chargement des recommandations');
    } finally {
      setLoading(false);
    }
  }

  async function handleApply(jobId: string) {
    if (!candidateId) return;

    setApplying(jobId);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('applications')
        .insert([{
          candidate_id: candidateId,
          job_id: jobId,
          status: 'pending'
        }]);

      if (error) {
        if (error.code === '23505') {
          setMessage({
            type: 'error',
            text: 'Vous avez déjà postulé à cette offre'
          });
        } else {
          throw error;
        }
        return;
      }

      setMessage({
        type: 'success',
        text: 'Candidature envoyée avec succès !'
      });

      // Retirer l'offre de la liste après candidature
      setMatches(prev => prev.filter(m => m.job_id !== jobId));
    } catch (err: any) {
      console.error('[CandidateJobMatches] Error applying:', err);
      setMessage({
        type: 'error',
        text: 'Erreur lors de l\'envoi de la candidature'
      });
    } finally {
      setApplying(null);
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 50) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Chargement de vos recommandations...</p>
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
          <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg">
            <h3 className="font-bold mb-2">Erreur</h3>
            <p>{error}</p>
            {error.includes('profil candidat') && (
              <button
                onClick={() => window.location.hash = '#/emplois/candidature'}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Créer mon profil candidat
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <TrendingUp className="w-10 h-10 text-orange-600" />
            Offres recommandées pour vous
          </h1>
          <p className="text-lg text-gray-600">
            Découvrez les offres d'emploi qui correspondent le mieux à votre profil
          </p>
        </div>

        {/* Message de succès/erreur */}
        {message && (
          <div className={message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800 p-3 rounded-md mb-6'
            : 'bg-red-50 border border-red-200 text-red-800 p-3 rounded-md mb-6'}>
            {message.text}
          </div>
        )}

        {/* Liste des matches */}
        {matches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Briefcase className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Aucune offre correspondante pour le moment
            </h3>
            <p className="text-gray-600">
              Complétez votre profil et ajoutez plus de compétences pour améliorer vos recommandations.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {matches.map((match) => (
              <div
                key={match.job_id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 p-6"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Infos principales */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {match.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold border ${getScoreColor(match.score)}`}
                        title={match.reason}
                      >
                        Match {match.score}%
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-orange-600" />
                        <span className="font-medium">{match.company}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>{match.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span>{match.contract_type}</span>
                      </div>
                      {match.seniority && (
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-purple-600" />
                          <span className="capitalize">{match.seniority}</span>
                        </div>
                      )}
                    </div>

                    {/* Raison du match */}
                    {match.reason && (
                      <div className="mb-3 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <span className="font-medium text-blue-900">Pourquoi cette offre ? </span>
                        {match.reason}
                      </div>
                    )}

                    {/* Compétences */}
                    {match.skills && match.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {match.skills.slice(0, 8).map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200"
                          >
                            {skill}
                          </span>
                        ))}
                        {match.skills.length > 8 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            +{match.skills.length - 8}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Salaire */}
                    {match.salary_min && match.salary_max && (
                      <div className="text-sm font-medium text-green-700">
                        💰 {match.salary_min} - {match.salary_max} TND/mois
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 lg:w-48">
                    <button
                      onClick={() => window.location.hash = `#/emplois/${match.job_id}`}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center"
                    >
                      Voir l'offre
                    </button>
                    <button
                      onClick={() => handleApply(match.job_id)}
                      disabled={applying === match.job_id}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {applying === match.job_id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>En cours...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Postuler</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
