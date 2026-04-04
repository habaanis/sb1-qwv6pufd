import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // Configuration optimale pour Bolt WebContainer
    hmr: {
      overlay: true, // Afficher les erreurs en overlay
    },
    watch: {
      usePolling: false, // Désactiver le polling pour de meilleures performances
    },
    // Pas besoin de historyApiFallback car on utilise HashRouter en dev
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-map': ['leaflet', 'react-leaflet'],
          'vendor-ui': ['framer-motion', 'lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'esbuild',
    target: 'esnext',
  },
});
