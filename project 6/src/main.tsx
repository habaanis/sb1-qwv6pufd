import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './lib/registerServiceWorker';
import { supportsWebP } from './lib/imageUtils';

// Suppression des warnings Supabase tracing non critiques
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const message = args[0]?.toString() || '';
  if (
    message.includes('Could not add aborted') ||
    message.includes('no active span found') ||
    message.includes('aborted.isDebounce')
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

// Détection de l'environnement Bolt WebContainer
const isBoltWebContainer = import.meta.env.DEV && (
  window.location.hostname.includes('webcontainer') ||
  window.location.hostname.includes('stackblitz') ||
  window.location.hostname.includes('bolt.new') ||
  window.location.port === '5173' // Port dev par défaut de Vite
);

// Utiliser HashRouter pour Bolt/dev, BrowserRouter pour production
const Router = isBoltWebContainer ? HashRouter : BrowserRouter;

console.log(`🚀 Router mode: ${isBoltWebContainer ? 'HashRouter (DEV/Bolt)' : 'BrowserRouter (PROD)'}`);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>
);

if (import.meta.env.PROD) {
  registerServiceWorker();
}

supportsWebP().then((supported) => {
  console.log(`[Image Optimization] WebP support: ${supported ? 'YES ✓' : 'NO ✗'}`);
});
