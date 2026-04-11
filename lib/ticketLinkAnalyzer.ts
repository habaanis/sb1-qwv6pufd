export interface TicketLinkAnalysis {
  text: string;
  colorClass: string;
  show: boolean;
}

export const analyzeTicketLink = (url?: string): TicketLinkAnalysis => {
  if (!url || url.trim() === '') {
    return { text: '', colorClass: '', show: false };
  }

  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('example') || lowerUrl.includes('description')) {
    return { text: '', colorClass: '', show: false };
  }

  if (lowerUrl.includes('facebook.com') || lowerUrl.includes('instagram.com')) {
    return {
      text: 'Voir l\'événement',
      colorClass: 'bg-gradient-to-r from-[#1877F2] to-[#0C63D4] hover:from-[#166FE5] hover:to-[#0A58C2]',
      show: true
    };
  }

  if (lowerUrl.includes('tesketki') || lowerUrl.includes('ibelit') || lowerUrl.includes('eventbrite')) {
    return {
      text: 'Réserver mes places',
      colorClass: 'bg-[#4A1D43] hover:bg-[#5A2D53]',
      show: true
    };
  }

  if (lowerUrl.includes('.tn')) {
    return {
      text: 'Site Officiel',
      colorClass: 'bg-gradient-to-r from-[#475569] to-[#334155] hover:from-[#3F4B5C] hover:to-[#2C3A4A]',
      show: true
    };
  }

  return {
    text: 'Réserver ma place',
    colorClass: 'bg-gradient-to-r from-[#C41E3A] to-[#8B0000] hover:from-[#A01828] hover:to-[#6B0000]',
    show: true
  };
};

export const getPrixValue = (prixString?: string): number => {
  if (!prixString) return -1;
  const match = prixString.match(/\d+/);
  return match ? parseInt(match[0]) : -1;
};
