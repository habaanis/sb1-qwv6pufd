import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { useTranslationExtended } from '../lib/useTranslationExtended';
import { useRTL } from '../lib/useRTL';

const EmailContact: React.FC = () => {
  const { language } = useLanguage();
  const te = useTranslationExtended(language);
  const { isRTL } = useRTL();
  const [showTooltip, setShowTooltip] = useState(false);
  const [copied, setCopied] = useState(false);
  const email = 'contact@dalil-tounes.com';
  const subject = 'Demande de renseignements - Dalil Tounes';

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <a
        href={`mailto:${email}?subject=${encodeURIComponent(subject)}`}
        className={`flex items-center gap-2 group cursor-pointer hover:bg-gray-800 rounded-lg px-3 py-2 -mx-3 transition-all ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <span className="text-gray-300 group-hover:text-[#D4AF37] group-hover:underline transition-all text-sm font-medium">
          {email}
        </span>
      </a>

      {showTooltip && (
        <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} bottom-full mb-2 z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-3 min-w-[280px]`}>
          <div className={`flex items-start justify-between gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="flex-1">
              <p className={`text-xs text-gray-400 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>{te.footer?.email || 'Adresse e-mail :'}</p>
              <p className={`text-sm text-white font-medium break-all ${isRTL ? 'text-right' : 'text-left'}`}>{email}</p>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#4A1D43] hover:bg-[#D4AF37] text-white text-xs font-medium rounded transition-colors border border-[#D4AF37]"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                {te.footer?.copied || 'Copié !'}
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                {te.footer?.copyAddress || 'Copier l\'adresse'}
              </>
            )}
          </button>
          <div className={`absolute ${isRTL ? 'right-6' : 'left-6'} bottom-[-6px] w-3 h-3 bg-gray-900 border-r border-b border-gray-700 transform rotate-45`}></div>
        </div>
      )}
    </div>
  );
};

const Footer: React.FC = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const te = useTranslationExtended(language);
  const { isRTL } = useRTL();

  return (
    <footer className="bg-[#1a1a1a] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-[#4A1D43] to-[#5A2D53] rounded-lg p-3 mb-8 border border-[#D4AF37] shadow-[0_2px_15px_rgba(212,175,55,0.2)]">
          <p className="text-center text-white text-sm md:text-base font-medium" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {t.home.footerVisibility.text}
          </p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-4 gap-8 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div>
            <h3 className="text-xl font-bold mb-3 text-white">{te.footer?.dalilTounes || 'Dalil Tounes'}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {te.footer?.platformDescription || 'La plateforme de référence pour trouver tous les établissements et services en Tunisie.'}
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">{te.footer?.navigation || 'Navigation'}</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-[#D4AF37] transition-colors text-sm">
                  {te.footer?.home || t.nav.home}
                </a>
              </li>
              <li>
                <a href="#/businesses" className="text-gray-300 hover:text-[#D4AF37] transition-colors text-sm">
                  {te.footer?.businesses || t.nav.businesses}
                </a>
              </li>
              <li>
                <a href="#/jobs" className="text-gray-300 hover:text-[#D4AF37] transition-colors text-sm">
                  {te.footer?.jobs || t.nav.jobs}
                </a>
              </li>
              <li>
                <a href="#/subscription" className="text-gray-300 hover:text-[#D4AF37] transition-colors text-sm">
                  {te.footer?.subscriptions || t.nav.subscription}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">{te.footer?.citizens || t.nav.citizens}</h4>
            <ul className="space-y-2">
              <li>
                <a href="#/citizens/health" className="text-gray-300 hover:text-[#D4AF37] transition-colors text-sm">
                  {te.footer?.health || 'Santé'}
                </a>
              </li>
              <li>
                <a href="#/education" className="text-gray-300 hover:text-[#D4AF37] transition-colors text-sm">
                  {te.footer?.education || 'Éducation'}
                </a>
              </li>
              <li>
                <a href="#/citizens/admin" className="text-gray-300 hover:text-[#D4AF37] transition-colors text-sm">
                  {te.footer?.publicServices || 'Services Publics'}
                </a>
              </li>
              <li>
                <a href="#/citizens/magasins" className="text-gray-300 hover:text-[#D4AF37] transition-colors text-sm">
                  {te.footer?.shops || 'Commerces & Magasins'}
                </a>
              </li>
              <li>
                <a href="#/citizens/leisure" className="text-gray-300 hover:text-[#D4AF37] transition-colors text-sm">
                  {te.footer?.leisure || 'Loisirs & Événements'}
                </a>
              </li>
              <li>
                <a href="#/citizens/social" className="text-gray-300 hover:text-[#D4AF37] transition-colors text-sm">
                  {te.footer?.socialServices || 'Services Sociaux'}
                </a>
              </li>
              <li>
                <a href="#/marketplace" className="text-gray-300 hover:text-[#D4AF37] transition-colors text-sm">
                  {te.footer?.localMarket || 'Marché Local'}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">{te.footer?.contact || 'Contact'}</h4>
            <div className="space-y-3">
              <EmailContact />
              <div>
                <a
                  href="https://www.facebook.com/daliltounes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-[#D4AF37] transition-colors text-sm"
                >
                  {te.footer?.dalilTounes || 'Dalil Tounes'}
                </a>
              </div>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                {te.footer?.digitalGuide || 'Le guide digital des établissements et services en Tunisie'}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6">
          <div className={`flex flex-col md:flex-row justify-between items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            <p className="text-gray-400 text-sm">
              {te.footer?.copyright || '© 2024 Dalil Tounes. Tous droits réservés.'}
            </p>
            <a
              href="#/subscription"
              className="inline-block px-6 py-2.5 bg-[#4A1D43] hover:bg-[#D4AF37] text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg border-2 border-[#D4AF37]"
            >
              {te.footer?.registerEstablishment || 'Inscrire mon établissement'}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;