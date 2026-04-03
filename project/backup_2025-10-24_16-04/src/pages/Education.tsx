import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, UserRound, Languages, MapPin, Search, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { searchEducation, searchTeachers } from '../lib/BoltDatabase';
import TeacherSignupModal from '../components/TeacherSignupModal';

type QuickKey = 'schools' | 'teachers' | 'languages';

export default function Education() {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [activeQuick, setActiveQuick] = useState<QuickKey | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [resultsSchools, setResultsSchools] = useState<any[]>([]);
  const [resultsTeachers, setResultsTeachers] = useState<any[]>([]);
  const [showTeacherModal, setShowTeacherModal] = useState(false);

  const isRTL = language === 'ar';

  const quickTiles = useMemo(() => ([
    {
      key: 'schools' as const,
      icon: GraduationCap,
      label: t.education.quick.schools,
      gradient: 'from-blue-50 to-indigo-50',
      border: 'border-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      key: 'teachers' as const,
      icon: UserRound,
      label: t.education.quick.teachers,
      gradient: 'from-emerald-50 to-green-50',
      border: 'border-emerald-100',
      iconColor: 'text-emerald-600'
    },
    {
      key: 'languages' as const,
      icon: Languages,
      label: t.education.quick.languages,
      gradient: 'from-amber-50 to-orange-50',
      border: 'border-amber-100',
      iconColor: 'text-amber-600'
    }
  ]), [t]);

  const runSearch = async (opts?: { quick?: QuickKey }) => {
    console.log("🔍 runSearch called with:", { keyword, city, quick: opts?.quick ?? activeQuick });
    setIsLoading(true);
    try {
      const quick = opts?.quick ?? activeQuick ?? null;

      const edu = await searchEducation({
        keyword,
        city,
        quick
      });

      console.log("✅ searchEducation returned:", edu?.length, "results");
      setResultsSchools(edu ?? []);

      const needTeachers = quick === 'teachers' || !!keyword || !!city;
      if (needTeachers) {
        const teachers = await searchTeachers({ keyword, city });
        console.log("✅ searchTeachers returned:", teachers?.length, "results");
        setResultsTeachers(teachers ?? []);
      } else {
        setResultsTeachers([]);
      }
    } catch (error) {
      console.error("❌ Error in runSearch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("🎓 Education page mounted");
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log("🎨 Rendering Education with:", { resultsSchools: resultsSchools.length, resultsTeachers: resultsTeachers.length, isLoading });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50/30">
      <section className="px-4 pt-14 pb-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-light text-gray-900"
            style={{ fontFamily: "'Playfair Display', serif" }}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {t.education.title}
          </motion.h1>
          <motion.p
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-gray-600 text-lg md:text-xl mt-4 font-light max-w-3xl mx-auto"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {t.education.subtitle}
          </motion.p>

          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className={`mt-8 bg-white/90 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-3 md:p-4`}
          >
            <div className={`flex flex-col md:flex-row items-stretch gap-3 ${isRTL ? 'md:flex-row-reverse' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-3 flex items-center">
                  <Search className="w-4 h-4 text-gray-400" />
                </span>
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={t.education.search.placeholderKeyword}
                  className="w-full pl-9 pr-3 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none text-sm"
                />
              </div>
              <div className="relative md:w-72">
                <span className="absolute inset-y-0 left-3 flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400" />
                </span>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t.education.search.placeholderCity}
                  className="w-full pl-9 pr-3 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none text-sm"
                />
              </div>
              <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} gap-2`}>
                <button
                  onClick={() => runSearch()}
                  className="px-5 py-3 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition shadow-sm inline-flex items-center gap-2"
                >
                  {t.education.search.searchBtn}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setKeyword(''); setCity(''); setActiveQuick(null); runSearch({ quick: null as any }); }}
                  className="px-4 py-3 rounded-lg bg-white text-gray-700 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition"
                >
                  {t.education.search.resetBtn}
                </button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto">
            {quickTiles.map(({ key, icon: Icon, label, gradient, border, iconColor }) => (
              <button
                key={key}
                onClick={() => { setActiveQuick(key); runSearch({ quick: key }); }}
                className={`group bg-gradient-to-br ${gradient} border ${border} rounded-xl p-5 text-left hover:shadow-md transition inline-flex items-center gap-4`}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <span className={`w-11 h-11 rounded-lg bg-white flex items-center justify-center shadow-sm ${iconColor}`}>
                  <Icon className="w-6 h-6" />
                </span>
                <span className="text-sm md:text-base text-gray-800 font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-medium text-gray-900">{t.education.results.schoolsTitle}</h2>
            <span className="text-sm text-gray-500">{isLoading ? t.common.loading : `${resultsSchools.length} ${t.common.results}`}</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resultsSchools.map((b) => (
              <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition">
                <div className="text-base font-semibold text-gray-900 mb-1">{b.nom || b.name}</div>
                <div className="text-sm text-gray-500 mb-3">{[b.ville || b.city, b.sous_categories || b.subcategory].filter(Boolean).join(' · ')}</div>
                <div className="text-sm text-gray-600 line-clamp-2 mb-3">{b.description || ''}</div>
                <div className="flex gap-2">
                  {(b.telephone || b.phone) && <a href={`tel:${b.telephone || b.phone}`} className="text-sm text-orange-700 hover:underline">{t.common.call}</a>}
                  {(b.site_web || b.website) && <a href={b.site_web || b.website} target="_blank" rel="noreferrer" className="text-sm text-gray-700 hover:underline">{t.common.website}</a>}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-12 mb-4">
            <h2 className="text-lg md:text-xl font-medium text-gray-900">{t.education.results.teachersTitle}</h2>
            <button
              onClick={() => setShowTeacherModal(true)}
              className="text-sm px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
            >
              {t.education.results.addTeacherCta}
            </button>
          </div>

          {resultsTeachers.length === 0 ? (
            <p className="text-sm text-gray-500">{t.education.results.noTeachers}</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resultsTeachers.map((p) => (
                <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition">
                  <div className="text-base font-semibold text-gray-900 mb-1">{p.nom}</div>
                  <div className="text-sm text-gray-500 mb-2">{[p.matiere, p.ville].filter(Boolean).join(' · ')}</div>
                  <div className="text-sm text-gray-600 line-clamp-2 mb-3">{p.description || ''}</div>
                  <div className="flex gap-2">
                    {p.telephone && <a href={`tel:${p.telephone}`} className="text-sm text-orange-700 hover:underline">{t.common.call}</a>}
                    {p.email && <a href={`mailto:${p.email}`} className="text-sm text-gray-700 hover:underline">{t.common.email}</a>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <TeacherSignupModal
        isOpen={showTeacherModal}
        onClose={() => setShowTeacherModal(false)}
      />
    </div>
  );
}
