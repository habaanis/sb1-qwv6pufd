import { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { Layout } from './components/Layout';
import { WelcomeModal } from './components/WelcomeModal';
import { Home } from './pages/Home';
import { Businesses } from './pages/Businesses';
import Citizens from './pages/Citizens';
import CitizensHealth from './pages/CitizensHealth';
import { Jobs } from './pages/Jobs';
import { Subscription } from './pages/Subscription';
import { PartnerSearch } from './pages/PartnerSearch';
import { BusinessEvents } from './pages/BusinessEvents';
import { BusinessDetail } from './pages/BusinessDetail';
import TransportInscription from './pages/TransportInscription';
import Education from './pages/Education';

type Page = 'home' | 'businesses' | 'citizens' | 'citizensHealth' | 'jobs' | 'subscription' | 'partnerSearch' | 'businessEvents' | 'businessDetail' | 'transportInscription' | 'education';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showBusinessSuggestionForm, setShowBusinessSuggestionForm] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<{ keyword: string; city: string } | null>(null);

  useEffect(() => {
    const hasVisited = localStorage.getItem('dalilTounes_hasVisited');
    if (!hasVisited) {
      setShowWelcomeModal(true);
      localStorage.setItem('dalilTounes_hasVisited', 'true');
    }
  }, []);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToBusiness = (businessId: string) => {
    setSelectedBusinessId(businessId);
    setCurrentPage('businessDetail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateBack = () => {
    setCurrentPage('home');
    setSelectedBusinessId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSuggestBusiness = () => {
    setShowBusinessSuggestionForm(true);
    setCurrentPage('businesses');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home
            onNavigate={handleNavigate}
            onSuggestBusiness={handleSuggestBusiness}
            onNavigateToBusiness={handleNavigateToBusiness}
            onSearchSubmit={(keyword, city) => setSearchParams({ keyword, city })}
          />
        );
      case 'businesses':
        return (
          <Businesses
            showSuggestionForm={showBusinessSuggestionForm}
            onCloseSuggestionForm={() => setShowBusinessSuggestionForm(false)}
            onNavigateToPartnerSearch={() => handleNavigate('partnerSearch')}
            onNavigateToJobs={() => handleNavigate('jobs')}
            onNavigateToBusinessEvents={() => handleNavigate('businessEvents')}
            initialSearchKeyword={searchParams?.keyword}
            initialSearchCity={searchParams?.city}
            onClearSearch={() => setSearchParams(null)}
          />
        );
      case 'partnerSearch':
        return <PartnerSearch />;
      case 'citizens':
        return <Citizens />;
      case 'citizensHealth':
        return <CitizensHealth onNavigate={handleNavigate} />;
      case 'transportInscription':
        return <TransportInscription />;
      case 'education':
        return <Education />;
      case 'jobs':
        return <Jobs />;
      case 'subscription':
        return <Subscription />;
      case 'businessEvents':
        return <BusinessEvents />;
      case 'businessDetail':
        return selectedBusinessId ? (
          <BusinessDetail
            businessId={selectedBusinessId}
            onNavigateBack={handleNavigateBack}
            onNavigateToBusiness={handleNavigateToBusiness}
          />
        ) : (
          <Home
            onNavigate={handleNavigate}
            onSuggestBusiness={handleSuggestBusiness}
            onNavigateToBusiness={handleNavigateToBusiness}
            onSearchSubmit={(keyword, city) => setSearchParams({ keyword, city })}
          />
        );
      default:
        return (
          <Home
            onNavigate={handleNavigate}
            onSuggestBusiness={handleSuggestBusiness}
            onNavigateToBusiness={handleNavigateToBusiness}
            onSearchSubmit={(keyword, city) => setSearchParams({ keyword, city })}
          />
        );
    }
  };

  return (
    <LanguageProvider>
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        onNavigate={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
      <Layout currentPage={currentPage} onNavigate={handleNavigate}>
        {renderPage()}
      </Layout>
    </LanguageProvider>
  );
}

export default App;
