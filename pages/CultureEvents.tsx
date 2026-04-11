import { useState, useEffect } from 'react';
import { Calendar, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/BoltDatabase';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../lib/i18n';
import CultureEventAgendaCard from '../components/CultureEventAgendaCard';
import { SECTEURS_CULTURE } from '../lib/cultureEventCategories';

interface CultureEvent {
  id: string;
  titre: string;
  ville: string;
  date_debut: string;
  date_fin?: string;
  image_url?: string;
  categorie?: string;
  description_courte?: string;
  prix?: string;
  lien_billetterie?: string;
  est_annuel?: boolean;
  type_affichage?: string;
  secteur_evenement?: string;
}

interface CultureEventsProps {
  onNavigateBack?: () => void;
}

export default function CultureEvents({ onNavigateBack }: CultureEventsProps = {}) {
  const { language } = useLanguage();

  const url = new URL(window.location.href);
  const secteurParam = url.searchParams.get('secteur') || 'all';

  const [weeklyEvents, setWeeklyEvents] = useState<CultureEvent[]>([]);
  const [monthlyEvents, setMonthlyEvents] = useState<CultureEvent[]>([]);
  const [annualEvents, setAnnualEvents] = useState<CultureEvent[]>([]);
  const [allEvents, setAllEvents] = useState<CultureEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSecteur, setSelectedSecteur] = useState<string>(secteurParam);

  const translations: Record<Language, any> = {
    fr: {
      title: 'Agenda Culturel',
      subtitle: 'Événements & Spectacles en Tunisie',
      description: 'Découvrez les événements culturels, concerts, festivals et spectacles à venir dans toute la Tunisie.',
      backButton: 'Retour',
      filterLabel: 'Type d\'événement :',
      allTypes: 'Tous types',
      artCulture: 'Art & Culture',
      sortiesSoirees: 'Sorties & Soirées',
      premiumAgenda: {
        weekly: {
          badge: 'Cette Semaine',
        },
        monthly: {
          badge: 'Ce Mois-ci',
        },
        annual: {
          badge: 'Événements Annuels',
        }
      },
      buyTickets: 'Réserver',
      noEvents: 'Aucun événement',
      loading: 'Chargement...'
    },
    en: {
      title: 'Cultural Agenda',
      subtitle: 'Events & Shows in Tunisia',
      description: 'Discover cultural events, concerts, festivals and upcoming shows throughout Tunisia.',
      backButton: 'Back',
      filterLabel: 'Event type:',
      allTypes: 'All types',
      artCulture: 'Art & Culture',
      sortiesSoirees: 'Outings & Evenings',
      premiumAgenda: {
        weekly: {
          badge: 'This Week',
        },
        monthly: {
          badge: 'This Month',
        },
        annual: {
          badge: 'Annual Events',
        }
      },
      buyTickets: 'Book Now',
      noEvents: 'No events',
      loading: 'Loading...'
    },
    ar: {
      title: 'الأجندة الثقافية',
      subtitle: 'الفعاليات والعروض في تونس',
      description: 'اكتشف الفعاليات الثقافية والحفلات والمهرجانات والعروض القادمة في جميع أنحاء تونس.',
      backButton: 'رجوع',
      filterLabel: 'نوع الفعالية:',
      allTypes: 'كل الأنواع',
      artCulture: 'فن وثقافة',
      sortiesSoirees: 'خروجات وسهرات',
      premiumAgenda: {
        weekly: {
          badge: 'هذا الأسبوع',
        },
        monthly: {
          badge: 'هذا الشهر',
        },
        annual: {
          badge: 'الفعاليات السنوية',
        }
      },
      buyTickets: 'احجز الآن',
      noEvents: 'لا توجد فعاليات',
      loading: 'جاري التحميل...'
    },
    it: {
      title: 'Agenda Culturale',
      subtitle: 'Eventi e Spettacoli in Tunisia',
      description: 'Scopri eventi culturali, concerti, festival e spettacoli in programma in tutta la Tunisia.',
      backButton: 'Indietro',
      filterLabel: 'Tipo di evento:',
      allTypes: 'Tutti i tipi',
      artCulture: 'Arte e Cultura',
      sortiesSoirees: 'Uscite e Serate',
      premiumAgenda: {
        weekly: {
          badge: 'Questa Settimana',
        },
        monthly: {
          badge: 'Questo Mese',
        },
        annual: {
          badge: 'Eventi Annuali',
        }
      },
      buyTickets: 'Prenota Ora',
      noEvents: 'Nessun evento',
      loading: 'Caricamento...'
    },
    ru: {
      title: 'Культурная Программа',
      subtitle: 'События и Шоу в Тунисе',
      description: 'Откройте для себя культурные события, концерты, фестивали и предстоящие шоу по всему Тунису.',
      backButton: 'Назад',
      filterLabel: 'Тип события:',
      allTypes: 'Все типы',
      artCulture: 'Искусство и Культура',
      sortiesSoirees: 'Прогулки и Вечера',
      premiumAgenda: {
        weekly: {
          badge: 'На Этой Неделе',
        },
        monthly: {
          badge: 'В Этом Месяце',
        },
        annual: {
          badge: 'Ежегодные События',
        }
      },
      buyTickets: 'Забронировать',
      noEvents: 'Нет событий',
      loading: 'Загрузка...'
    }
  };

  const t = translations[language];

  useEffect(() => {
    loadAgendaEvents();
  }, [selectedSecteur]);

  const loadAgendaEvents = async () => {
    setLoading(true);

    try {
      const { data: allData, error: allError } = await supabase
        .from('culture_events')
        .select('*')
        .order('date_debut', { ascending: true });

      if (allError) {
        console.error('Erreur:', allError);
        setWeeklyEvents([]);
        setMonthlyEvents([]);
        setAnnualEvents([]);
        setLoading(false);
        return;
      }

      if (!allData || allData.length === 0) {
        setWeeklyEvents([]);
        setMonthlyEvents([]);
        setAnnualEvents([]);
        setLoading(false);
        return;
      }

      let filtered = allData;
      if (selectedSecteur !== 'all') {
        filtered = allData.filter(e => e.secteur_evenement === selectedSecteur);
      }

      const weekly = filtered.filter(e => e.type_affichage?.toLowerCase() === 'hebdo');
      const monthly = filtered.filter(e => e.type_affichage?.toLowerCase() === 'mensuel');
      const annual = filtered.filter(e => e.type_affichage?.toLowerCase() === 'annuel');

      setWeeklyEvents(weekly);
      setMonthlyEvents(monthly);
      setAnnualEvents(annual);
      setAllEvents(allData);

      console.log('Événements chargés:', { total: allData.length, weekly: weekly.length, monthly: monthly.length, annual: annual.length });

    } catch (error: any) {
      console.error('Exception:', error);
      setWeeklyEvents([]);
      setMonthlyEvents([]);
      setAnnualEvents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0f1729]">
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {onNavigateBack && (
            <button
              onClick={onNavigateBack}
              className="absolute top-0 left-4 flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">{t.backButton}</span>
            </button>
          )}

          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-[#D4AF37] blur-2xl opacity-30 rounded-full"></div>
                <Calendar className="relative w-20 h-20 text-[#D4AF37] drop-shadow-2xl" />
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
              {t.title}
            </h1>
            <p className="text-xl text-[#D4AF37] font-semibold mb-4">
              {t.subtitle}
            </p>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
              {t.description}
            </p>

            <div className="flex justify-center items-center gap-3 mt-8">
              <label className="text-white font-semibold text-sm">
                {t.filterLabel}
              </label>
              <select
                value={selectedSecteur}
                onChange={(e) => setSelectedSecteur(e.target.value)}
                className="px-6 py-3 rounded-xl border-2 border-[#D4AF37]/30 bg-white/10 backdrop-blur-sm text-white font-medium focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/20 outline-none transition-all hover:bg-white/15"
              >
                <option value="all" className="bg-[#1a1f3a] text-white">{t.allTypes}</option>
                {SECTEURS_CULTURE.map((secteur) => (
                  <option key={secteur} value={secteur} className="bg-[#1a1f3a] text-white">
                    {secteur}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
              <p className="text-gray-300 mt-4">{t.loading}</p>
            </div>
          ) : (
            <div className="space-y-16 max-w-7xl mx-auto">
              <div>
                <div className="flex justify-center items-center gap-4 mb-4">
                  <h2 className="text-3xl font-bold text-cyan-400 text-center">
                    {t.premiumAgenda.weekly.badge}
                  </h2>
                  <span className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-full font-bold text-xl border-2 border-cyan-400">
                    {weeklyEvents.length} événement{weeklyEvents.length > 1 ? 's' : ''}
                  </span>
                </div>
                {weeklyEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {weeklyEvents.map((event) => (
                      <CultureEventAgendaCard
                        key={event.id}
                        event={event}
                        type="weekly"
                        badge={t.premiumAgenda.weekly.badge}
                        noEventText={t.noEvents}
                        buttonText={t.buyTickets}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Aucun événement cette semaine</p>
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-center items-center gap-4 mb-4">
                  <h2 className="text-3xl font-bold text-emerald-400 text-center">
                    {t.premiumAgenda.monthly.badge}
                  </h2>
                  <span className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full font-bold text-xl border-2 border-emerald-400">
                    {monthlyEvents.length} événement{monthlyEvents.length > 1 ? 's' : ''}
                  </span>
                </div>
                {monthlyEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {monthlyEvents.map((event) => (
                      <CultureEventAgendaCard
                        key={event.id}
                        event={event}
                        type="monthly"
                        badge={t.premiumAgenda.monthly.badge}
                        noEventText={t.noEvents}
                        buttonText={t.buyTickets}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Aucun événement ce mois-ci</p>
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-center items-center gap-4 mb-4">
                  <h2 className="text-3xl font-bold text-[#FFD700] text-center">
                    {t.premiumAgenda.annual.badge}
                  </h2>
                  <span className="px-4 py-2 bg-[#D4AF37]/20 text-[#FFD700] rounded-full font-bold text-xl border-2 border-[#FFD700]">
                    {annualEvents.length} événement{annualEvents.length > 1 ? 's' : ''}
                  </span>
                </div>
                {annualEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {annualEvents.map((event) => (
                      <CultureEventAgendaCard
                        key={event.id}
                        event={event}
                        type="annual"
                        badge={t.premiumAgenda.annual.badge}
                        noEventText={t.noEvents}
                        buttonText={t.buyTickets}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Aucun événement annuel</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
