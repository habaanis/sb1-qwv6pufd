import React from 'react';

export default function DebugI18nBadge() {
  const isDev = import.meta.env.DEV;

  if (!isDev) return null;

  const handleClick = () => {
    window.location.hash = '#/debug/i18n';
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-20 right-4 z-50 px-3 py-2 bg-yellow-500 text-white rounded-lg shadow-lg hover:bg-yellow-600 transition-colors text-sm font-medium flex items-center gap-1"
      title="Debug i18n - Traductions manquantes"
    >
      <span>🌐</span>
      <span>i18n</span>
    </button>
  );
}
