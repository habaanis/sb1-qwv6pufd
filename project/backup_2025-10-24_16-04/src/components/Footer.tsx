import React from 'react';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

const Footer: React.FC = () => {
  const { t, isRTL } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className={`flex items-center space-x-2 mb-4 ${isRTL ? 'space-x-reverse flex-row-reverse' : ''}`}>
              <MapPin className="h-8 w-8 text-blue-400" />
              <div>
                <h3 className="text-xl font-bold">{t('appName')}</h3>
                <p className="text-gray-400 text-sm">{t('appSubtitle')}</p>
              </div>
            </div>
            <p className={`text-gray-400 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('footerDescription')}
            </p>
            <div className={`flex space-x-4 ${isRTL ? 'space-x-reverse flex-row-reverse' : ''}`}>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className={`text-lg font-semibold mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('navigation')}
            </h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('home')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('establishments')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('subscriptions')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('contact')}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className={`text-lg font-semibold mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('categories')}
            </h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('hotel')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('cultural')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('administrative')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('sport')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('sante')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('justice')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('ecole')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('taxi')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('alimentation')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('divers')}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className={`text-lg font-semibold mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('contact')}
            </h4>
            <div className="space-y-3">
              <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse flex-row-reverse' : ''}`}>
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400">+216 70 000 000</span>
              </div>
              <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse flex-row-reverse' : ''}`}>
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400">contact@dalil-tounes.tn</span>
              </div>
              <div className={`flex items-start space-x-2 ${isRTL ? 'space-x-reverse flex-row-reverse' : ''}`}>
                <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                <span className="text-gray-400">
                  Avenue Habib Bourguiba<br />
                  Tunis, Tunisie
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Dalil Tounes. {t('allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;