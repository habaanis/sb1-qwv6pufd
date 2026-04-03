import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { supabase } from '../lib/BoltDatabase';
import { Search, Briefcase, MapPin, Building2, Clock, DollarSign, X, Plus, Users, Target, TrendingUp } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  category: string;
  city: string;
  type: string;
  description: string;
  requirements: string;
  salary_range?: string;
  contact_email: string;
  contact_phone?: string;
  created_at: string;
}

export const Jobs = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    category: '',
    city: '',
    type: 'full-time',
    description: '',
    requirements: '',
    salary_range: '',
    contact_email: '',
    contact_phone: '',
  });

  const [applicationForm, setApplicationForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    city: '',
    job_category: '',
    experience_years: 0,
    description: '',
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('job_postings').insert([
        {
          title: jobForm.title,
          company: jobForm.company,
          category: jobForm.category,
          city: jobForm.city,
          type: jobForm.type,
          description: jobForm.description,
          requirements: jobForm.requirements,
          salary_range: jobForm.salary_range || null,
          contact_email: jobForm.contact_email,
          contact_phone: jobForm.contact_phone || null,
        },
      ]);

      if (error) throw error;

      alert(t.jobs.postForm.success);
      setJobForm({
        title: '',
        company: '',
        category: '',
        city: '',
        type: 'full-time',
        description: '',
        requirements: '',
        salary_range: '',
        contact_email: '',
        contact_phone: '',
      });
      setShowPostForm(false);
      fetchJobs();
    } catch (error) {
      console.error('Error posting job:', error);
      alert(t.jobs.postForm.error);
    }
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('job_applications').insert([
        {
          full_name: applicationForm.full_name,
          email: applicationForm.email,
          phone: applicationForm.phone,
          city: applicationForm.city,
          job_category: applicationForm.job_category,
          experience_years: applicationForm.experience_years,
          description: applicationForm.description,
        },
      ]);

      if (error) throw error;

      alert(t.jobs.applicationForm.success);
      setApplicationForm({
        full_name: '',
        email: '',
        phone: '',
        city: '',
        job_category: '',
        experience_years: 0,
        description: '',
      });
      setShowApplicationForm(false);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert(t.jobs.applicationForm.error);
    }
  };

  const categories = [...new Set(jobs.map((j) => j.category))];
  const cities = [...new Set(jobs.map((j) => j.city))];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || job.category === selectedCategory;
    const matchesCity = !selectedCity || job.city === selectedCity;
    const matchesType = !selectedType || job.type === selectedType;
    return matchesSearch && matchesCategory && matchesCity && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-br from-red-50 via-white to-orange-50 py-20 px-4 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 bg-red-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-600 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1
              className="text-4xl md:text-6xl font-light text-gray-900 mb-6"
              style={{ lineHeight: '1.2', fontFamily: "'Playfair Display', serif" }}
            >
              {t.jobs.title}
            </h1>
            <p className="text-xl text-gray-600 font-light mb-8 max-w-3xl mx-auto" style={{ lineHeight: '1.6' }}>
              {t.jobs.subtitle}
            </p>
            <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto" style={{ lineHeight: '1.8' }}>
              {t.jobs.description}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Category Cards Section - Like Businesses Page */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Post a Job Card */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer border border-orange-100"
            >
              <div className="flex items-center justify-center w-14 h-14 bg-white rounded-full mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Plus className="w-7 h-7 text-orange-600" />
              </div>
              <h3
                className="text-lg font-light text-gray-900 mb-3 text-center italic"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {t.jobs.postJob}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4 text-center" style={{ lineHeight: '1.6' }}>
                Publiez vos offres d'emploi et trouvez les talents dont votre entreprise a besoin.
              </p>
              <button
                onClick={() => setShowPostForm(true)}
                className="w-full px-4 py-2 text-sm text-orange-600 bg-white rounded-lg hover:shadow-md transition-all font-medium"
              >
                {t.jobs.postJob}
              </button>
            </motion.div>

            {/* Find a Job Card */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer border border-green-100"
            >
              <div className="flex items-center justify-center w-14 h-14 bg-white rounded-full mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Briefcase className="w-7 h-7 text-green-600" />
              </div>
              <h3
                className="text-lg font-light text-gray-900 mb-3 text-center italic"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {t.jobs.findJob}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4 text-center" style={{ lineHeight: '1.6' }}>
                Consultez les opportunités d'emploi et déposez votre candidature en ligne.
              </p>
              <button
                onClick={() => setShowApplicationForm(true)}
                className="w-full px-4 py-2 text-sm text-green-600 bg-white rounded-lg hover:shadow-md transition-all font-medium"
              >
                {t.jobs.findJob}
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-red-600 to-red-700 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>

            <div className="relative z-10">
              <h3
                className="text-2xl md:text-3xl font-light mb-4"
                style={{ lineHeight: '1.6', fontFamily: "'Playfair Display', serif" }}
              >
                {t.jobs.emptyState.title}
              </h3>
              <p className="text-base md:text-lg font-light leading-relaxed text-red-50 max-w-2xl mx-auto" style={{ lineHeight: '1.7' }}>
                {t.jobs.emptyState.subtitle}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">

        {showPostForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">{t.jobs.postForm.title}</h2>
                <button
                  onClick={() => setShowPostForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleJobSubmit} className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.jobs.postForm.jobTitle} *
                    </label>
                    <input
                      type="text"
                      required
                      value={jobForm.title}
                      onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.jobs.postForm.company} *
                    </label>
                    <input
                      type="text"
                      required
                      value={jobForm.company}
                      onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.jobs.postForm.category} *
                    </label>
                    <input
                      type="text"
                      required
                      value={jobForm.category}
                      onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.jobs.postForm.city} *
                    </label>
                    <input
                      type="text"
                      required
                      value={jobForm.city}
                      onChange={(e) => setJobForm({ ...jobForm, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.jobs.postForm.type} *
                  </label>
                  <select
                    required
                    value={jobForm.type}
                    onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="full-time">{t.jobs.filter.fullTime}</option>
                    <option value="part-time">{t.jobs.filter.partTime}</option>
                    <option value="contract">{t.jobs.filter.contract}</option>
                    <option value="internship">{t.jobs.filter.internship}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.jobs.postForm.description} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.jobs.postForm.requirements} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={jobForm.requirements}
                    onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.jobs.postForm.salary}
                  </label>
                  <input
                    type="text"
                    value={jobForm.salary_range}
                    onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.jobs.postForm.contactEmail} *
                    </label>
                    <input
                      type="email"
                      required
                      value={jobForm.contact_email}
                      onChange={(e) => setJobForm({ ...jobForm, contact_email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.jobs.postForm.contactPhone}
                    </label>
                    <input
                      type="tel"
                      value={jobForm.contact_phone}
                      onChange={(e) => setJobForm({ ...jobForm, contact_phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPostForm(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                  >
                    {t.jobs.postForm.submit}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showApplicationForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">{t.jobs.applicationForm.title}</h2>
                <button
                  onClick={() => setShowApplicationForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleApplicationSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.jobs.applicationForm.fullName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={applicationForm.full_name}
                    onChange={(e) => setApplicationForm({ ...applicationForm, full_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.jobs.applicationForm.email} *
                    </label>
                    <input
                      type="email"
                      required
                      value={applicationForm.email}
                      onChange={(e) => setApplicationForm({ ...applicationForm, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.jobs.applicationForm.phone} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={applicationForm.phone}
                      onChange={(e) => setApplicationForm({ ...applicationForm, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.jobs.applicationForm.city} *
                    </label>
                    <input
                      type="text"
                      required
                      value={applicationForm.city}
                      onChange={(e) => setApplicationForm({ ...applicationForm, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.jobs.applicationForm.category} *
                    </label>
                    <input
                      type="text"
                      required
                      value={applicationForm.job_category}
                      onChange={(e) => setApplicationForm({ ...applicationForm, job_category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.jobs.applicationForm.experience} *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={applicationForm.experience_years}
                    onChange={(e) =>
                      setApplicationForm({ ...applicationForm, experience_years: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.jobs.applicationForm.description} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={applicationForm.description}
                    onChange={(e) => setApplicationForm({ ...applicationForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowApplicationForm(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                  >
                    {t.jobs.applicationForm.submit}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t.jobs.searchJobs}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                <option value="">{t.businesses.allCategories}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                <option value="">{t.businesses.allCities}</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                <option value="">{t.jobs.filter.allTypes}</option>
                <option value="full-time">{t.jobs.filter.fullTime}</option>
                <option value="part-time">{t.jobs.filter.partTime}</option>
                <option value="contract">{t.jobs.filter.contract}</option>
                <option value="internship">{t.jobs.filter.internship}</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">{t.common.loading}</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-12 border-2 border-gray-100">
                <Briefcase className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-light text-gray-800 mb-4" style={{ lineHeight: '1.6' }}>
                  {t.jobs.emptyState.title}
                </h3>
                <p className="text-base text-gray-600 font-light leading-relaxed">
                  {t.jobs.emptyState.subtitle}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-orange-300 p-6"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2 hover:text-orange-600 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{job.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{job.type}</span>
                      </div>
                      {job.salary_range && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span>{job.salary_range}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 line-clamp-2">{job.description}</p>
                  </div>
                  <div className="flex items-center">
                    <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold whitespace-nowrap">
                      {t.common.viewDetails}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedJob && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-8">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-3xl font-bold mb-3">{selectedJob.title}</h2>
                <div className="flex flex-wrap items-center gap-4 text-orange-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    <span className="font-semibold">{selectedJob.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{selectedJob.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{selectedJob.type}</span>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {selectedJob.salary_range && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-orange-600" />
                      {t.jobs.details.salary}
                    </h3>
                    <p className="text-gray-700">{selectedJob.salary_range}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{t.common.description}</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{t.jobs.details.requirements}</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selectedJob.requirements}</p>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">{t.jobs.details.contact}</h3>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-semibold">{t.common.email}:</span>{' '}
                      <a href={`mailto:${selectedJob.contact_email}`} className="text-orange-600 hover:underline">
                        {selectedJob.contact_email}
                      </a>
                    </p>
                    {selectedJob.contact_phone && (
                      <p className="text-gray-700">
                        <span className="font-semibold">{t.common.phone}:</span>{' '}
                        <a href={`tel:${selectedJob.contact_phone}`} className="text-orange-600 hover:underline">
                          {selectedJob.contact_phone}
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <a
                    href={`mailto:${selectedJob.contact_email}?subject=Application for ${selectedJob.title}`}
                    className="block w-full text-center px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all font-bold text-lg"
                  >
                    Postuler maintenant
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </section>
    </div>
  );
};
