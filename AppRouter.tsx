import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Subscription } from './pages/Subscription';

const Businesses = lazy(() => import('./pages/Businesses').then(m => ({ default: m.Businesses })));
const Citizens = lazy(() => import('./pages/Citizens'));
const CitizensHealth = lazy(() => import('./pages/CitizensHealth'));
const CitizensAdmin = lazy(() => import('./pages/CitizensAdmin'));
const CitizensLeisure = lazy(() => import('./pages/CitizensLeisure'));
const CitizensShops = lazy(() => import('./pages/CitizensShops'));
const CitizensServices = lazy(() => import('./pages/CitizensServices'));
const CitizensTourism = lazy(() => import('./pages/CitizensTourism'));
const CultureEvents = lazy(() => import('./pages/CultureEvents'));
const Jobs = lazy(() => import('./pages/Jobs').then(m => ({ default: m.Jobs })));
const PartnerSearch = lazy(() => import('./pages/PartnerSearch').then(m => ({ default: m.PartnerSearch })));
const BusinessEvents = lazy(() => import('./pages/BusinessEvents').then(m => ({ default: m.BusinessEvents })));
const BusinessDetail = lazy(() => import('./components/BusinessDetail').then(m => ({ default: m.BusinessDetail })));
const TransportInscription = lazy(() => import('./pages/TransportInscription'));
const Education = lazy(() => import('./pages/EducationNew'));
const EducationEventForm = lazy(() => import('./pages/EducationEventForm'));
const LocalMarketplace = lazy(() => import('./pages/LocalMarketplace'));
const AdminSourcing = lazy(() => import('./pages/AdminSourcing'));
const AroundMe = lazy(() => import('./pages/AroundMe'));
const SearchDebug = lazy(() => import('./pages/debug/SearchDebug'));
const EntrepriseDebug = lazy(() => import('./pages/debug/EntrepriseDebug'));
const I18nDebug = lazy(() => import('./pages/debug/I18nDebug'));
const CandidateProfile = lazy(() => import('./pages/CandidateProfile'));
const CandidateList = lazy(() => import('./pages/CandidateList'));
const PublishJob = lazy(() => import('./pages/PublishJob'));
const BusinessList = lazy(() => import('./pages/BusinessList'));
const PartnerDirectory = lazy(() => import('./pages/PartnerDirectory'));
const CandidateJobMatches = lazy(() => import('./pages/CandidateJobMatches'));
const JobCandidateMatches = lazy(() => import('./pages/JobCandidateMatches'));
const PartnerRequestsAdmin = lazy(() => import('./pages/PartnerRequestsAdmin'));
const AdminInscriptionsLoisirs = lazy(() => import('./pages/AdminInscriptionsLoisirs'));
const Auth = lazy(() => import('./pages/Auth'));
const CandidateDashboard = lazy(() => import('./pages/CandidateDashboard'));
const CompanyDashboard = lazy(() => import('./pages/CompanyDashboard'));
const Concept = lazy(() => import('./pages/Concept'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
  </div>
);

function AppRouter() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Page d'accueil */}
              <Route path="/" element={<Home />} />

              {/* Sections Citoyens */}
              <Route path="/citizens" element={<Citizens />} />
              <Route path="/citizens/health" element={<CitizensHealth />} />
              <Route path="/citizens/sante" element={<CitizensHealth />} />
              <Route path="/citizens/admin" element={<CitizensAdmin />} />
              <Route path="/citizens/leisure" element={<CitizensLeisure />} />
              <Route path="/citizens/loisirs" element={<CitizensLeisure />} />
              <Route path="/citizens/shops" element={<CitizensShops />} />
              <Route path="/citizens/magasins" element={<CitizensShops />} />
              <Route path="/citizens/services" element={<CitizensServices />} />
              <Route path="/citizens/tourism" element={<CitizensTourism />} />
              <Route path="/citizens/tourisme" element={<CitizensTourism />} />

              {/* Entreprises */}
              <Route path="/businesses" element={<Businesses />} />
              <Route path="/entreprises" element={<Businesses />} />
              <Route path="/business/:id/:slug?" element={<BusinessDetail />} />
              <Route path="/entreprise/:id/:slug?" element={<BusinessDetail />} />
              <Route path="/entreprises/:id/:slug?" element={<BusinessDetail />} />
              <Route path="/p/:slug" element={<BusinessDetail />} />

              {/* Emplois */}
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/emploi" element={<Jobs />} />
              <Route path="/emplois" element={<Jobs />} />
              <Route path="/emplois/publier" element={<PublishJob />} />
              <Route path="/emplois/mes-recommandations" element={<CandidateJobMatches />} />
              <Route path="/emplois/:jobId/candidats" element={<JobCandidateMatches />} />

              {/* Education */}
              <Route path="/education" element={<Education />} />
              <Route path="/education-event-form" element={<EducationEventForm />} />

              {/* Culture & Evenements */}
              <Route path="/culture-events" element={<CultureEvents />} />
              <Route path="/evenements" element={<CultureEvents />} />

              {/* Marketplace */}
              <Route path="/marketplace" element={<LocalMarketplace />} />
              <Route path="/marche-local" element={<LocalMarketplace />} />
              <Route path="/local-marketplace" element={<LocalMarketplace />} />

              {/* Geolocalisation */}
              <Route path="/around-me" element={<AroundMe />} />
              <Route path="/autour-de-moi" element={<AroundMe />} />

              {/* Auth */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/connexion" element={<Auth />} />
              <Route path="/inscription" element={<Auth />} />

              {/* Dashboards */}
              <Route path="/dashboard/candidat" element={<CandidateDashboard />} />
              <Route path="/dashboard/entreprise" element={<CompanyDashboard />} />

              {/* Pages publiques */}
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/abonnement" element={<Subscription />} />
              <Route path="/concept" element={<Concept />} />
              <Route path="/notre-concept" element={<Concept />} />

              {/* Partenaires */}
              <Route path="/partner-search" element={<PartnerSearch />} />
              <Route path="/partner-directory" element={<PartnerDirectory />} />
              <Route path="/annuaire-partenaires" element={<PartnerDirectory />} />

              {/* Autres */}
              <Route path="/business-events" element={<BusinessEvents />} />
              <Route path="/transport-inscription" element={<TransportInscription />} />
              <Route path="/candidate-profile" element={<CandidateProfile />} />
              <Route path="/candidates" element={<CandidateList />} />
              <Route path="/candidats" element={<CandidateList />} />
              <Route path="/business-list" element={<BusinessList />} />

              {/* Admin */}
              <Route path="/admin/partner-requests" element={<PartnerRequestsAdmin />} />
              <Route path="/admin/inscriptions-loisirs" element={<AdminInscriptionsLoisirs />} />
              <Route path="/admin/sourcing" element={<AdminSourcing />} />

              {/* Debug */}
              <Route path="/searchDebug" element={<SearchDebug />} />
              <Route path="/debug/entreprise" element={<EntrepriseDebug />} />
              <Route path="/debug/i18n" element={<I18nDebug />} />

              {/* Anciennes routes hash - redirection */}
              <Route path="/#/*" element={<Navigate to="/" replace />} />

              {/* 404 - Redirection vers accueil */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default AppRouter;
