import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { supabase } from '../lib/supabaseClient';
import { useSimpleJobSearch } from '../hooks/useSimpleJobSearch';
import { X, Plus, ArrowLeft } from 'lucide-react';
import SimpleJobCard from '../components/SimpleJobCard';
import JobDetail from './JobDetail';
import JobSearchBar from '../components/JobSearchBar';
import { getSupabaseImageUrl } from '../lib/imageUtils';
import StructuredData from '../components/StructuredData';
import { generateCollectionPageSchema } from '../lib/structuredDataSchemas';
import JobPostForm from '../components/forms/JobPostForm';

export const Jobs = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGouvernorat, setSelectedGouvernorat] = useState('');
  const [selectedJobSector, setSelectedJobSector] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [anonymousUserId, setAnonymousUserId] = useState<string>('');

  const { jobs, loading: searchLoading } = useSimpleJobSearch({
    searchTerm,
    gouvernorat: selectedGouvernorat,
    secteur: selectedJobSector,
    companyName
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        let storedId = localStorage.getItem('dalil_anonymous_job_id');
        if (!storedId) {
          storedId = `anon_job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('dalil_anonymous_job_id', storedId);
        }
        setAnonymousUserId(storedId);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = () => {
    console.log('Searching with:', { searchTerm, selectedGouvernorat, selectedJobSector });
  };

  const [applicationForm, setApplicationForm] = useState({
    nom_complet: '',
    email: '',
    telephone: '',
    ville_residence: '',
    secteur_emploi: '',
    annees_experience: 0,
    description: '',
  });

  const handleJobPostSuccess = () => {
    setShowPostForm(false);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('candidates').insert([
        {
          nom_complet: applicationForm.nom_complet,
          email: applicationForm.email,
          telephone: applicationForm.telephone,
          ville_residence: applicationForm.ville_residence,
          category: applicationForm.secteur_emploi,
          annees_experience: applicationForm.annees_experience,
          competences: [],
        },
      ]);

      if (error) throw error;

      alert(t.jobs.applicationForm.success);
      setApplicationForm({
        nom_complet: '',
        email: '',
        telephone: '',
        ville_residence: '',
        secteur_emploi: '',
        annees_experience: 0,
        description: '',
      });
      setShowApplicationForm(false);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert(t.jobs.applicationForm.error);
    }
  };


  return (
    <div className="min-h-screen" style={{
      backgroundColor: '#F8F9FA'
    }}>
      <StructuredData
        data={generateCollectionPageSchema(
          'Offres d\'Emploi en Tunisie - Dalil Tounes',
          'Découvrez les dernières offres d\'emploi en Tunisie dans tous les secteurs',
          []
        )}
      />
      {/* Bouton Retour aux catégories */}
      <div className="bg-gradient-to-br from-orange-900 via-orange-800 to-orange-900 pt-6 px-4">
        <div className="max-w-5xl mx-auto">
          <a
            href="#/citizens"
            className="inline-flex items-center gap-2 text-white hover:text-orange-200 transition font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour aux catégories
          </a>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative py-20 px-4 overflow-hidden"
        style={{
          borderBottom: '2px solid #D4AF37'
        }}
      >
        {/* Image du drapeau tunisien en arrière-plan */}
        <img
          src={getSupabaseImageUrl('drapeau-tunisie.jpg')}
          alt="Drapeau de la Tunisie"
          className="absolute inset-0 w-full h-full object-cover brightness-105"
        />

        {/* Overlay bordeaux avec 60% d'opacité */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: '#4A1D43',
            opacity: 0.6
          }}
        ></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1
              className="text-3xl md:text-5xl font-light mb-4 drop-shadow-lg"
              style={{
                lineHeight: '1.2',
                fontFamily: "'Playfair Display', serif",
                color: '#D4AF37'
              }}
            >
              {t.jobs.title}
            </h1>
            <p className="text-base md:text-lg text-white font-light mb-6 max-w-3xl mx-auto drop-shadow" style={{ lineHeight: '1.6' }}>
              {t.jobs.subtitle}
            </p>
            <p className="text-sm md:text-base text-white/95 leading-relaxed max-w-3xl mx-auto drop-shadow" style={{ lineHeight: '1.8' }}>
              {t.jobs.description}
            </p>
          </motion.div>
        </div>
      </motion.div>

      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group relative rounded-xl px-4 py-4 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1 overflow-hidden"
              style={{
                backgroundColor: '#4A1D43',
                border: '1px solid #D4AF37',
                boxShadow: '0 10px 30px rgba(74, 29, 67, 0.3)'
              }}
            >
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-black border border-[#D4AF37] rounded-md">
                <span className="text-[9px] font-bold tracking-wider text-[#D4AF37]">PREMIUM</span>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#800000] to-[#600000] rounded-full mb-3 mx-auto group-hover:scale-110 transition-transform shadow-lg">
                <Plus className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3
                className="text-lg font-light text-[#D4AF37] mb-2 text-center"
                style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.5px' }}
              >
                {t.jobs.postJob}
              </h3>
              <p className="text-xs text-white leading-snug mb-3 text-center" style={{ lineHeight: '1.5' }}>
                Publiez vos offres d'emploi et trouvez les talents dont votre entreprise a besoin.
              </p>
              <button
                onClick={() => setShowPostForm(true)}
                className="w-full px-4 py-2 text-xs text-[#D4AF37] bg-[#4A1D43] backdrop-blur-sm border border-[#D4AF37] rounded-lg hover:bg-[#5A2D53] hover:text-white transition-all font-semibold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {t.jobs.postJob}
              </button>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="group relative rounded-xl px-4 py-4 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1 overflow-hidden"
              style={{
                backgroundColor: '#4A1D43',
                border: '1px solid #D4AF37',
                boxShadow: '0 10px 30px rgba(74, 29, 67, 0.3)'
              }}
            >
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-black border border-[#D4AF37] rounded-md">
                <span className="text-[9px] font-bold tracking-wider text-[#D4AF37]">TALENT</span>
              </div>
              <h3
                className="text-lg font-light text-[#D4AF37] mb-2 text-center mt-4"
                style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.5px' }}
              >
                {t.jobs.findJob}
              </h3>
              <p className="text-xs text-white leading-snug mb-3 text-center" style={{ lineHeight: '1.5' }}>
                Consultez les opportunités d'emploi et déposez votre candidature en ligne.
              </p>
              <button
                onClick={() => setShowApplicationForm(true)}
                className="w-full px-4 py-2 text-xs text-[#D4AF37] bg-[#4A1D43] backdrop-blur-sm border border-[#D4AF37] rounded-lg hover:bg-[#5A2D53] hover:text-white transition-all font-semibold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {t.jobs.findJob}
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="section-emploi-recherche" className="py-12 px-4 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <JobSearchBar
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            selectedGouvernorat={selectedGouvernorat}
            onSelectedGouvernoratChange={setSelectedGouvernorat}
            selectedJobSector={selectedJobSector}
            onSelectedJobSectorChange={setSelectedJobSector}
            companyName={companyName}
            onCompanyNameChange={setCompanyName}
            onSearch={handleSearch}
          />

          <div id="section-emploi-offres" className="scroll-mt-24">
            {searchLoading ? (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-[#4A1D43] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-700">{t.common.loading}</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white rounded-2xl p-12 border-2 border-[#D4AF37] shadow-lg">
                    <h3 className="text-2xl font-light text-[#800020] mb-4" style={{ lineHeight: '1.6' }}>
                      {t.jobs.emptyState.title}
                    </h3>
                    <p className="text-base text-gray-600 font-light leading-relaxed">
                      {t.jobs.emptyState.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-4 mt-8">
                {jobs.map((job) => (
                  <SimpleJobCard
                    key={job.id}
                    job={job}
                    onClick={() => setSelectedJob(job)}
                  />
                ))}
              </div>
            )}
          </div>

          {selectedJob && (
            <JobDetail
              jobId={selectedJob.id}
              onClose={() => setSelectedJob(null)}
            />
          )}

          {showPostForm && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#1A1A1A] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#D4AF37]">
                <div className="sticky top-0 bg-[#1A1A1A] border-b border-[#D4AF37] px-6 py-4 flex justify-between items-center z-10">
                  <h2 className="text-2xl font-light text-[#F5F5DC]">
                    {t.jobPost?.title || 'Publier une offre d\'emploi'}
                  </h2>
                  <button
                    onClick={() => setShowPostForm(false)}
                    className="p-2 hover:bg-[#D4AF37]/20 rounded-full transition-colors text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6">
                  <JobPostForm
                    userId={user?.id || anonymousUserId}
                    onSuccess={handleJobPostSuccess}
                  />
                </div>
              </div>
            </div>
          )}

          {showApplicationForm && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#4A1D43] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#D4AF37]/50">
                <div className="sticky top-0 bg-[#4A1D43] border-b border-[#D4AF37]/50 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-[#D4AF37]">{t.jobs.applicationForm.title}</h2>
                  <button
                    onClick={() => setShowApplicationForm(false)}
                    className="p-2 hover:bg-[#D4AF37]/20 rounded-full transition-colors text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleApplicationSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      {t.jobs.applicationForm.fullName} *
                    </label>
                    <input
                      type="text"
                      required
                      value={applicationForm.nom_complet}
                      onChange={(e) => setApplicationForm({ ...applicationForm, nom_complet: e.target.value })}
                      className="w-full px-4 py-2 bg-white text-gray-900 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        {t.jobs.applicationForm.email} *
                      </label>
                      <input
                        type="email"
                        required
                        value={applicationForm.email}
                        onChange={(e) => setApplicationForm({ ...applicationForm, email: e.target.value })}
                        className="w-full px-4 py-2 bg-white text-gray-900 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        {t.jobs.applicationForm.phone} *
                      </label>
                      <input
                        type="tel"
                        required
                        value={applicationForm.telephone}
                        onChange={(e) => setApplicationForm({ ...applicationForm, telephone: e.target.value })}
                        className="w-full px-4 py-2 bg-white text-gray-900 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        {t.jobs.applicationForm.city} *
                      </label>
                      <input
                        type="text"
                        required
                        value={applicationForm.ville_residence}
                        onChange={(e) => setApplicationForm({ ...applicationForm, ville_residence: e.target.value })}
                        className="w-full px-4 py-2 bg-white text-gray-900 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        {t.jobs.applicationForm.category} *
                      </label>
                      <input
                        type="text"
                        required
                        value={applicationForm.secteur_emploi}
                        onChange={(e) => setApplicationForm({ ...applicationForm, secteur_emploi: e.target.value })}
                        className="w-full px-4 py-2 bg-white text-gray-900 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      {t.jobs.applicationForm.experience} *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={applicationForm.annees_experience}
                      onChange={(e) =>
                        setApplicationForm({ ...applicationForm, annees_experience: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-2 bg-white text-gray-900 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      {t.jobs.applicationForm.description} *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={applicationForm.description}
                      onChange={(e) => setApplicationForm({ ...applicationForm, description: e.target.value })}
                      className="w-full px-4 py-2 bg-white text-gray-900 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowApplicationForm(false)}
                      className="flex-1 px-8 py-3 border border-[#D4AF37] text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold text-center"
                    >
                      {t.common.cancel}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-8 py-3 bg-gradient-to-r from-[#4169E1] to-[#00CED1] text-white rounded-lg hover:shadow-[0_0_20px_rgba(65,105,225,0.5)] transition-all font-semibold text-center"
                    >
                      {t.jobs.applicationForm.submit}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
