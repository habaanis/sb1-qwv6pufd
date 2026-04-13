import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, DollarSign, User, Phone, Clock, CheckCircle, XCircle, MessageCircle, Filter } from 'lucide-react';
import { supabase } from '../lib/BoltDatabase';
import { Layout } from '../components/Layout';
import { Toast } from '../components/Toast';

interface Inscription {
  id: string;
  prenom: string;
  nom_evenement: string;
  organisateur: string;
  ville: string;
  date_prevue: string | null;
  date_debut: string | null;
  date_fin: string | null;
  prix_entree: string;
  description: string;
  whatsapp: string;
  type_affichage: string;
  est_organisateur: boolean;
  contact_tel: string;
  statut: string;
  statut_whatsylync: string;
  lien_contact_whatsapp: string;
  lien_billetterie: string | null;
  created_at: string;
}

const AdminInscriptionsLoisirs: React.FC = () => {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    fetchInscriptions();
  }, []);

  const fetchInscriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inscriptions_loisirs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInscriptions(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des inscriptions:', error);
      setToastType('error');
      setToastMessage('Erreur lors du chargement des inscriptions');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const updateStatut = async (id: string, newStatut: string) => {
    try {
      const { error } = await supabase
        .from('inscriptions_loisirs')
        .update({ statut: newStatut })
        .eq('id', id);

      if (error) throw error;

      setInscriptions(prev =>
        prev.map(ins => ins.id === id ? { ...ins, statut: newStatut } : ins)
      );

      setToastType('success');
      setToastMessage(`Statut mis à jour: ${newStatut}`);
      setShowToast(true);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setToastType('error');
      setToastMessage('Erreur lors de la mise à jour du statut');
      setShowToast(true);
    }
  };

  const updateLienBilletterie = async (id: string, lienBilletterie: string) => {
    try {
      const { error } = await supabase
        .from('inscriptions_loisirs')
        .update({ lien_billetterie: lienBilletterie || null })
        .eq('id', id);

      if (error) throw error;

      setInscriptions(prev =>
        prev.map(ins => ins.id === id ? { ...ins, lien_billetterie: lienBilletterie || null } : ins)
      );

      setToastType('success');
      setToastMessage('Lien de billetterie mis à jour');
      setShowToast(true);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du lien:', error);
      setToastType('error');
      setToastMessage('Erreur lors de la mise à jour du lien de billetterie');
      setShowToast(true);
    }
  };

  const filteredInscriptions = filterStatut === 'all'
    ? inscriptions
    : inscriptions.filter(ins => ins.statut === filterStatut);

  const getStatutBadge = (statut: string) => {
    const styles = {
      'En attente': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Validé': 'bg-green-100 text-green-800 border-green-300',
      'Refusé': 'bg-red-100 text-red-800 border-red-300',
    };
    return styles[statut as keyof typeof styles] || styles['En attente'];
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non spécifiée';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Chargement des inscriptions...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 p-8">
              <h1 className="text-4xl font-bold text-white mb-2">
                Gestion des Inscriptions Loisirs
              </h1>
              <p className="text-orange-50 text-lg">
                {filteredInscriptions.length} inscription(s) {filterStatut !== 'all' ? `- ${filterStatut}` : ''}
              </p>
            </div>

            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-700">Filtrer par statut:</span>
                <select
                  value={filterStatut}
                  onChange={(e) => setFilterStatut(e.target.value)}
                  className="px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                >
                  <option value="all">Tous</option>
                  <option value="En attente">En attente</option>
                  <option value="Validé">Validé</option>
                  <option value="Refusé">Refusé</option>
                </select>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {filteredInscriptions.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Aucune inscription trouvée</p>
                </div>
              ) : (
                filteredInscriptions.map((inscription) => (
                  <div
                    key={inscription.id}
                    className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                              {inscription.nom_evenement}
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${getStatutBadge(inscription.statut)}`}>
                                {inscription.statut}
                              </span>
                              {inscription.est_organisateur && (
                                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border-2 border-blue-300">
                                  Organisateur
                                </span>
                              )}
                              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 border-2 border-purple-300">
                                {inscription.type_affichage}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <User className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            <span className="font-medium">Proposé par:</span>
                            <span className="text-gray-900 font-semibold">{inscription.prenom}</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className="font-medium">WhatsApp:</span>
                            <span className="text-gray-900">{inscription.whatsapp}</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-700">
                            <User className="w-5 h-5 text-teal-500 flex-shrink-0" />
                            <span className="font-medium">Organisateur:</span>
                            <span className="text-gray-900">{inscription.organisateur}</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className="font-medium">Ville:</span>
                            <span className="text-gray-900">{inscription.ville}</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-5 h-5 text-rose-500 flex-shrink-0" />
                            <span className="font-medium">Date:</span>
                            <span className="text-gray-900">{formatDate(inscription.date_prevue)}</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-700">
                            <DollarSign className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                            <span className="font-medium">Prix:</span>
                            <span className="text-gray-900 font-semibold">{inscription.prix_entree}</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-700 col-span-2">
                            <Clock className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <span className="font-medium">Reçu le:</span>
                            <span className="text-gray-900">{formatDate(inscription.created_at)}</span>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Description:</p>
                          <p className="text-gray-700 leading-relaxed">{inscription.description}</p>
                        </div>

                        {inscription.date_fin && (
                          <div className="bg-blue-50 rounded-xl p-4 mb-4 border-2 border-blue-200">
                            <p className="text-sm font-semibold text-blue-800 mb-1">
                              Événement Multi-jours
                            </p>
                            <p className="text-sm text-blue-700">
                              Du {formatDate(inscription.date_debut || inscription.date_prevue)} au {formatDate(inscription.date_fin)}
                            </p>
                          </div>
                        )}

                        {inscription.lien_billetterie && (
                          <div className="bg-green-50 rounded-xl p-4 mb-4 border-2 border-green-200">
                            <p className="text-sm font-semibold text-green-800 mb-2">
                              Lien de Billetterie:
                            </p>
                            <a
                              href={inscription.lien_billetterie}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-green-700 hover:text-green-900 underline break-all"
                            >
                              {inscription.lien_billetterie}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                          Lien Billetterie:
                        </label>
                        <input
                          type="url"
                          value={inscription.lien_billetterie || ''}
                          onChange={(e) => updateLienBilletterie(inscription.id, e.target.value)}
                          className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                          placeholder="https://whatsylync.com/event/..."
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <a
                        href={inscription.lien_contact_whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[200px] px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Contacter sur WhatsApp
                      </a>

                      {inscription.statut === 'En attente' && (
                        <>
                          <button
                            onClick={() => updateStatut(inscription.id, 'Validé')}
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Valider
                          </button>
                          <button
                            onClick={() => updateStatut(inscription.id, 'Refusé')}
                            className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
                          >
                            <XCircle className="w-5 h-5" />
                            Refuser
                          </button>
                        </>
                      )}

                      {inscription.statut !== 'En attente' && (
                        <button
                          onClick={() => updateStatut(inscription.id, 'En attente')}
                          className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
                        >
                          <Clock className="w-5 h-5" />
                          Remettre en attente
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </Layout>
  );
};

export default AdminInscriptionsLoisirs;
