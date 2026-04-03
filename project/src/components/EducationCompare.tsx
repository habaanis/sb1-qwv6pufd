import { X, Award, Users, TrendingUp, CheckCircle2, Video, MapPin, DollarSign, Globe, Calendar, Utensils, Home as HomeIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Etablissement {
  id: string;
  nom: string;
  type_etablissement: string;
  niveau_etude: string;
  systeme_enseignement: string;
  langue_principale: string;
  frais_scolarite_range: string;
  frais_min?: number;
  frais_max?: number;
  ville: string;
  telephone: string;
  email: string;
  site_web: string;
  description: string;
  accreditations: string[];
  homologue_francais: boolean;
  homologation_etrangere: boolean;
  agrement_ministre: boolean;
  ratio_eleves_enseignant?: number;
  ratio_eleves_prof?: number;
  taux_reussite_bac?: number;
  transport_scolaire: boolean;
  cantine: boolean;
  internat: boolean;
  note_moyenne: number;
  nombre_avis: number;
  services_inclus?: string[];
  annee_fondation?: number;
  capacite_accueil?: number;
  langues_enseignees?: string[];
  activites_extra?: string[];
  lien_video_visite?: string;
}

interface Props {
  etablissements: Etablissement[];
  onClose: () => void;
  language?: string;
}

const translations = {
  fr: {
    title: "Comparaison d'établissements",
    close: "Fermer",
    generalInfo: "Informations générales",
    name: "Nom",
    type: "Type",
    niveau: "Niveau",
    system: "Système",
    ville: "Ville",
    founded: "Fondé en",
    capacity: "Capacité",
    students: "élèves",
    trustBadges: "Badges de confiance",
    homologueFr: "Homologué Français",
    homologueEtr: "Homologation Étrangère",
    agrementMin: "Agrément Ministère",
    accreditations: "Accréditations",
    none: "Aucune",
    kpis: "Statistiques clés",
    tauxReussite: "Taux réussite BAC",
    ratio: "Ratio élèves/prof",
    notemoyenne: "Note moyenne",
    nbAvis: "avis",
    services: "Services & Infrastructures",
    transport: "Transport scolaire",
    cantine: "Cantine",
    internat: "Internat",
    languages: "Langues enseignées",
    activities: "Activités extra-scolaires",
    fees: "Frais de scolarité",
    range: "Fourchette",
    min: "Minimum",
    max: "Maximum",
    servicesInclus: "Services inclus",
    premium: "Visite virtuelle",
    available: "Disponible",
    contact: "Contact",
    yes: "Oui",
    no: "Non"
  },
  en: {
    title: "School Comparison",
    close: "Close",
    generalInfo: "General Information",
    name: "Name",
    type: "Type",
    niveau: "Level",
    system: "System",
    ville: "City",
    founded: "Founded",
    capacity: "Capacity",
    students: "students",
    trustBadges: "Trust Badges",
    homologueFr: "French Accredited",
    homologueEtr: "Foreign Accreditation",
    agrementMin: "Ministry Approval",
    accreditations: "Accreditations",
    none: "None",
    kpis: "Key Statistics",
    tauxReussite: "BAC Success Rate",
    ratio: "Student/Teacher ratio",
    notemoyenne: "Average rating",
    nbAvis: "reviews",
    services: "Services & Infrastructure",
    transport: "School transport",
    cantine: "Canteen",
    internat: "Boarding",
    languages: "Languages taught",
    activities: "Extra-curricular activities",
    fees: "Tuition Fees",
    range: "Range",
    min: "Minimum",
    max: "Maximum",
    servicesInclus: "Included services",
    premium: "Virtual tour",
    available: "Available",
    contact: "Contact",
    yes: "Yes",
    no: "No"
  },
  ar: {
    title: "مقارنة المؤسسات",
    close: "إغلاق",
    generalInfo: "معلومات عامة",
    name: "الاسم",
    type: "النوع",
    niveau: "المستوى",
    system: "النظام",
    ville: "المدينة",
    founded: "تأسست في",
    capacity: "السعة",
    students: "طالب",
    trustBadges: "شارات الثقة",
    homologueFr: "معتمد فرنسي",
    homologueEtr: "اعتماد أجنبي",
    agrementMin: "موافقة الوزارة",
    accreditations: "الاعتمادات",
    none: "لا يوجد",
    kpis: "إحصائيات رئيسية",
    tauxReussite: "معدل نجاح البكالوريا",
    ratio: "نسبة الطلاب/المعلم",
    notemoyenne: "التقييم المتوسط",
    nbAvis: "تقييم",
    services: "الخدمات والبنية التحتية",
    transport: "نقل مدرسي",
    cantine: "مقصف",
    internat: "سكن داخلي",
    languages: "اللغات المدرسة",
    activities: "الأنشطة اللاصفية",
    fees: "رسوم الدراسة",
    range: "النطاق",
    min: "الحد الأدنى",
    max: "الحد الأقصى",
    servicesInclus: "الخدمات المشمولة",
    premium: "جولة افتراضية",
    available: "متاح",
    contact: "اتصال",
    yes: "نعم",
    no: "لا"
  }
};

export default function EducationCompare({ etablissements, onClose, language = 'fr' }: Props) {
  const t = translations[language as keyof typeof translations] || translations.fr;
  const isRTL = language === 'ar';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full my-8"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 rounded-t-2xl flex items-center justify-between z-10">
            <h2 className="text-2xl font-light flex items-center gap-3">
              <Award className="w-7 h-7" />
              {t.title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tableau comparatif */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="p-4 text-left font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10 min-w-[200px]">
                    {/* Critères */}
                  </th>
                  {etablissements.map((etab) => (
                    <th key={etab.id} className="p-4 text-center min-w-[280px]">
                      <div className="font-semibold text-gray-900 text-lg mb-1">{etab.nom}</div>
                      <div className="text-sm text-gray-600">{etab.ville}</div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {/* Informations générales */}
                <tr className="bg-blue-50/50">
                  <td colSpan={etablissements.length + 1} className="p-3 font-semibold text-blue-900 sticky left-0 bg-blue-50/50 z-10">
                    {t.generalInfo}
                  </td>
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white z-10">{t.type}</td>
                  {etablissements.map((etab) => (
                    <td key={etab.id} className="p-4 text-center text-gray-900">{etab.type_etablissement}</td>
                  ))}
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white z-10">{t.niveau}</td>
                  {etablissements.map((etab) => (
                    <td key={etab.id} className="p-4 text-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{etab.niveau_etude}</span>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white z-10">{t.system}</td>
                  {etablissements.map((etab) => (
                    <td key={etab.id} className="p-4 text-center text-gray-900">{etab.systeme_enseignement}</td>
                  ))}
                </tr>

                {etablissements.some(e => e.annee_fondation) && (
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white z-10">{t.founded}</td>
                    {etablissements.map((etab) => (
                      <td key={etab.id} className="p-4 text-center text-gray-900">
                        {etab.annee_fondation ? (
                          <div className="flex items-center justify-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            {etab.annee_fondation}
                          </div>
                        ) : '-'}
                      </td>
                    ))}
                  </tr>
                )}

                {etablissements.some(e => e.capacite_accueil) && (
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white z-10">{t.capacity}</td>
                    {etablissements.map((etab) => (
                      <td key={etab.id} className="p-4 text-center text-gray-900">
                        {etab.capacite_accueil ? `${etab.capacite_accueil} ${t.students}` : '-'}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Badges de confiance */}
                <tr className="bg-green-50/50">
                  <td colSpan={etablissements.length + 1} className="p-3 font-semibold text-green-900 sticky left-0 bg-green-50/50 z-10">
                    {t.trustBadges}
                  </td>
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white z-10">{t.homologueFr}</td>
                  {etablissements.map((etab) => (
                    <td key={etab.id} className="p-4 text-center">
                      {etab.homologue_francais ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white z-10">{t.homologueEtr}</td>
                  {etablissements.map((etab) => (
                    <td key={etab.id} className="p-4 text-center">
                      {etab.homologation_etrangere ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white z-10">{t.agrementMin}</td>
                  {etablissements.map((etab) => (
                    <td key={etab.id} className="p-4 text-center">
                      {etab.agrement_ministre ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white z-10">{t.accreditations}</td>
                  {etablissements.map((etab) => (
                    <td key={etab.id} className="p-4">
                      {etab.accreditations && etab.accreditations.length > 0 ? (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {etab.accreditations.map((acc, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {acc}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">{t.none}</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* KPIs */}
                <tr className="bg-amber-50/50">
                  <td colSpan={etablissements.length + 1} className="p-3 font-semibold text-amber-900 sticky left-0 bg-amber-50/50 z-10">
                    {t.kpis}
                  </td>
                </tr>

                {etablissements.some(e => e.taux_reussite_bac) && (
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white z-10">{t.tauxReussite}</td>
                    {etablissements.map((etab) => (
                      <td key={etab.id} className="p-4 text-center">
                        {etab.taux_reussite_bac ? (
                          <div className="flex items-center justify-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            <span className="text-lg font-semibold text-green-700">{etab.taux_reussite_bac}%</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}

                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white z-10">{t.ratio}</td>
                  {etablissements.map((etab) => (
                    <td key={etab.id} className="p-4 text-center">
                      {(etab.ratio_eleves_enseignant || etab.ratio_eleves_prof) ? (
                        <div className="flex items-center justify-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold">{etab.ratio_eleves_enseignant || etab.ratio_eleves_prof}:1</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white z-10">{t.notemoyenne}</td>
                  {etablissements.map((etab) => (
                    <td key={etab.id} className="p-4 text-center">
                      {etab.note_moyenne > 0 ? (
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-semibold text-yellow-600">{etab.note_moyenne.toFixed(1)}/5</span>
                          <span className="text-xs text-gray-500">({etab.nombre_avis} {t.nbAvis})</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Services */}
                <tr className="bg-purple-50/50">
                  <td colSpan={etablissements.length + 1} className="p-3 font-semibold text-purple-900 sticky left-0 bg-purple-50/50 z-10">
                    {t.services}
                  </td>
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white z-10">{t.transport}</td>
                  {etablissements.map((etab) => (
                    <td key={etab.id} className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm ${etab.transport_scolaire ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {etab.transport_scolaire ? t.yes : t.no}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white z-10">{t.cantine}</td>
                  {etablissements.map((etab) => (
                    <td key={etab.id} className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm ${etab.cantine ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {etab.cantine ? t.yes : t.no}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white z-10">{t.internat}</td>
                  {etablissements.map((etab) => (
                    <td key={etab.id} className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm ${etab.internat ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {etab.internat ? t.yes : t.no}
                      </span>
                    </td>
                  ))}
                </tr>

                {etablissements.some(e => e.langues_enseignees && e.langues_enseignees.length > 0) && (
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white z-10">{t.languages}</td>
                    {etablissements.map((etab) => (
                      <td key={etab.id} className="p-4">
                        {etab.langues_enseignees && etab.langues_enseignees.length > 0 ? (
                          <div className="flex flex-wrap gap-1 justify-center">
                            {etab.langues_enseignees.map((lang, idx) => (
                              <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                {lang}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}

                {etablissements.some(e => e.activites_extra && e.activites_extra.length > 0) && (
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white z-10">{t.activities}</td>
                    {etablissements.map((etab) => (
                      <td key={etab.id} className="p-4">
                        {etab.activites_extra && etab.activites_extra.length > 0 ? (
                          <div className="text-sm text-gray-700 text-center">
                            {etab.activites_extra.slice(0, 3).join(', ')}
                            {etab.activites_extra.length > 3 && '...'}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Frais */}
                <tr className="bg-orange-50/50">
                  <td colSpan={etablissements.length + 1} className="p-3 font-semibold text-orange-900 sticky left-0 bg-orange-50/50 z-10">
                    {t.fees}
                  </td>
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white z-10">{t.range}</td>
                  {etablissements.map((etab) => (
                    <td key={etab.id} className="p-4 text-center">
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                        {etab.frais_scolarite_range}
                      </span>
                    </td>
                  ))}
                </tr>

                {etablissements.some(e => e.frais_min || e.frais_max) && (
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white z-10">{t.min} - {t.max}</td>
                    {etablissements.map((etab) => (
                      <td key={etab.id} className="p-4 text-center">
                        {etab.frais_min && etab.frais_max ? (
                          <div className="flex items-center justify-center gap-2">
                            <DollarSign className="w-4 h-4 text-orange-600" />
                            <span className="font-semibold">{etab.frais_min} - {etab.frais_max} TND</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}

                {etablissements.some(e => e.services_inclus && e.services_inclus.length > 0) && (
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white z-10">{t.servicesInclus}</td>
                    {etablissements.map((etab) => (
                      <td key={etab.id} className="p-4">
                        {etab.services_inclus && etab.services_inclus.length > 0 ? (
                          <ul className="text-sm text-gray-700 space-y-1 text-left">
                            {etab.services_inclus.map((service, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className="text-green-600">•</span>
                                <span>{service}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-400 text-center block">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Premium VIP */}
                {etablissements.some(e => e.lien_video_visite) && (
                  <tr className="bg-gradient-to-r from-yellow-50 to-amber-50">
                    <td className="p-4 font-medium text-gray-700 sticky left-0 bg-gradient-to-r from-yellow-50 to-amber-50 z-10 flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-600" />
                      {t.premium}
                    </td>
                    {etablissements.map((etab) => (
                      <td key={etab.id} className="p-4 text-center">
                        {etab.lien_video_visite ? (
                          <div className="flex items-center justify-center gap-2">
                            <Video className="w-5 h-5 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-700">{t.available}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer avec contacts */}
          <div className="p-6 bg-gray-50 rounded-b-2xl border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {etablissements.map((etab) => (
                <div key={etab.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">{etab.nom}</h4>
                  {etab.telephone && (
                    <a href={`tel:${etab.telephone}`} className="text-sm text-blue-600 hover:underline block mb-1">
                      📞 {etab.telephone}
                    </a>
                  )}
                  {etab.email && (
                    <a href={`mailto:${etab.email}`} className="text-sm text-blue-600 hover:underline block mb-1">
                      ✉️ {etab.email}
                    </a>
                  )}
                  {etab.site_web && (
                    <a href={etab.site_web} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline block">
                      🌐 {etab.site_web}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
