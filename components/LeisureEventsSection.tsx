import React from 'react';
import { MapPin, Palette, PartyPopper, Utensils, Building, Mountain, Dumbbell } from 'lucide-react';
import { SECTEURS_CONFIG } from '../lib/cultureEventCategories';

interface LeisureCard {
  id: string;
  image: string;
  title: string;
  location: string;
  tab: 'evenements' | 'lieux';
  secteur?: string;
  icon: typeof MapPin;
}

const leisureCards: LeisureCard[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    title: 'Saveurs & Traditions',
    location: 'Gastronomie',
    tab: 'evenements',
    secteur: 'Saveurs & Traditions',
    icon: Utensils
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=800&q=80',
    title: 'Musée & Patrimoine',
    location: 'Sites historiques',
    tab: 'evenements',
    secteur: 'Musée & Patrimoine',
    icon: Building
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    title: 'Escapades & Nature',
    location: 'Nature & Détente',
    tab: 'evenements',
    secteur: 'Escapades & Nature',
    icon: Mountain
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    title: 'Festivals & artisanat',
    location: 'Événements culturels',
    tab: 'evenements',
    secteur: 'Festivals & artisanat',
    icon: PartyPopper
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80',
    title: 'Sport & Aventure',
    location: 'Activités sportives',
    tab: 'evenements',
    secteur: 'Sport & Aventure',
    icon: Dumbbell
  }
];

export const LeisureEventsSection: React.FC = () => {
  return (
    <section className="py-3 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4">
          <h2 className="text-lg md:text-xl font-light text-gray-900 mb-2">
            Loisirs & Événements en Tunisie
          </h2>
          <p className="text-gray-600 text-sm">
            Découvrez les meilleurs endroits pour vos sorties et moments de détente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
          {leisureCards.map((card) => {
            const Icon = card.icon;
            const url = card.secteur
              ? `#/culture-events?secteur=${encodeURIComponent(card.secteur)}`
              : `#/culture-events`;

            return (
              <a
                key={card.id}
                href={url}
                className="group cursor-pointer block"
              >
                <div className="relative overflow-hidden rounded-2xl border border-[#D4AF37] shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(74,29,67,0.15)] hover:scale-105">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  </div>

                  <div className="absolute top-3 right-3">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-[#D4AF37]">
                      <Icon className="w-4 h-4 text-[#4A1D43]" />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-base mb-1.5 drop-shadow-lg">
                      {card.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-white/90">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="text-xs drop-shadow">{card.location}</span>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        <div className="text-center">
          <a
            href="#/citizens/leisure"
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#4A1D43] hover:bg-[#5A2D53] text-[#D4AF37] font-semibold rounded-lg border border-[#D4AF37] transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.5)] hover:scale-105 text-sm"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Découvrir toutes les sorties
          </a>
        </div>
      </div>
    </section>
  );
};

export default LeisureEventsSection;
