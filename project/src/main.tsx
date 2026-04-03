import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './lib/registerServiceWorker';
import { supportsWebP } from './lib/imageUtils';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

if (import.meta.env.PROD) {
  registerServiceWorker();
}

supportsWebP().then((supported) => {
  console.log(`[Image Optimization] WebP support: ${supported ? 'YES ✓' : 'NO ✗'}`);
});
