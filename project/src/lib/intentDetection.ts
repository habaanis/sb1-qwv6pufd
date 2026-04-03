export type PageCategorie = 'sante' | 'education' | 'administration' | 'loisirs' | 'magasin' | 'marche_local';

export interface IntentResult {
  categorie: PageCategorie | null;
  confidence: number;
  shouldRedirect: boolean;
}

const INTENT_KEYWORDS: Record<PageCategorie, string[]> = {
  sante: [
    'médecin', 'docteur', 'hôpital', 'clinique', 'pharmacie', 'dentiste',
    'ophtalmologue', 'cardiologue', 'pédiatre', 'gynécologue', 'dermatologue',
    'kinésithérapeute', 'infirmier', 'laboratoire', 'analyses', 'radiologie',
    'urgence', 'santé', 'consultation', 'soins', 'médical', 'chirurgien',
    'optique', 'orthophoniste', 'nutritionniste', 'psychiatre'
  ],
  education: [
    'école', 'lycée', 'collège', 'université', 'institut', 'formation',
    'cours', 'enseignement', 'professeur', 'étudiant', 'crèche', 'maternelle',
    'primaire', 'secondaire', 'bac', 'diplôme', 'apprentissage', 'éducation',
    'académie', 'centre formation', 'stage', 'tuteur'
  ],
  administration: [
    'mairie', 'municipalité', 'préfecture', 'gouvernorat', 'administration',
    'services publics', 'état civil', 'carte identité', 'passeport', 'permis',
    'tribunal', 'justice', 'police', 'douane', 'impôts', 'taxes',
    'sécurité sociale', 'cnss', 'ministère', 'délégation', 'consulat'
  ],
  loisirs: [
    'restaurant', 'café', 'bar', 'cinéma', 'théâtre', 'musée', 'parc',
    'sport', 'gym', 'fitness', 'piscine', 'plage', 'hôtel', 'auberge',
    'tourisme', 'voyage', 'loisir', 'divertissement', 'bowling', 'jeux',
    'club', 'discothèque', 'spa', 'détente', 'activité'
  ],
  magasin: [
    'magasin', 'boutique', 'commerce', 'supermarché', 'épicerie', 'boulangerie',
    'pâtisserie', 'boucherie', 'poissonnerie', 'primeur',
    'vêtements', 'chaussures',
    'électronique', 'informatique', 'téléphone',
    'librairie', 'parfumerie', 'bijouterie',
    'quincaillerie', 'bricolage', 'meuble', 'décoration',
    'jouet'
  ],
  marche_local: [
    'marché', 'souk', 'foire', 'bazar', 'artisan', 'artisanat', 'traditionnel',
    'local', 'produits locaux', 'fruits', 'légumes', 'épices', 'tissus',
    'poterie', 'cuir', 'tapis', 'antiquités', 'brocante'
  ]
};

const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.65,
  MEDIUM: 0.4,
  LOW: 0.2
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function calculateScore(query: string, keywords: string[]): number {
  const normalizedQuery = normalizeText(query);
  const words = normalizedQuery.split(/\s+/);

  let matches = 0;
  let totalWeight = 0;

  keywords.forEach((keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    const keywordWords = normalizedKeyword.split(/\s+/);

    if (normalizedQuery.includes(normalizedKeyword)) {
      matches += keywordWords.length * 2;
      totalWeight += keywordWords.length;
    } else {
      keywordWords.forEach((kw) => {
        if (words.some(w => w.includes(kw) || kw.includes(w))) {
          matches += 0.5;
          totalWeight += 0.5;
        }
      });
    }
  });

  const maxPossibleScore = Math.max(words.length, totalWeight || 1);
  return matches / maxPossibleScore;
}

export function detectIntent(query: string): IntentResult {
  if (!query || query.trim().length < 2) {
    return {
      categorie: null,
      confidence: 0,
      shouldRedirect: false
    };
  }

  const scores: Array<{ categorie: PageCategorie; score: number }> = [];

  (Object.entries(INTENT_KEYWORDS) as Array<[PageCategorie, string[]]>).forEach(([categorie, keywords]) => {
    const score = calculateScore(query, keywords);
    if (score > 0) {
      scores.push({ categorie, score });
    }
  });

  scores.sort((a, b) => b.score - a.score);

  if (scores.length === 0 || scores[0].score < CONFIDENCE_THRESHOLDS.LOW) {
    return {
      categorie: null,
      confidence: 0,
      shouldRedirect: false
    };
  }

  const topScore = scores[0];
  const shouldRedirect = topScore.score >= CONFIDENCE_THRESHOLDS.HIGH;

  return {
    categorie: topScore.categorie,
    confidence: topScore.score,
    shouldRedirect
  };
}

export function getCategoryRoute(categorie: PageCategorie): string {
  const routes: Record<PageCategorie, string> = {
    sante: '#/citizens/health',
    education: '#/education',
    administration: '#/citizens/admin',
    loisirs: '#/citizens/leisure',
    magasin: '#/citizens/shops',
    marche_local: '#/local-marketplace'
  };

  return routes[categorie] || '#/entreprises';
}

export function getCategoryDisplayName(categorie: PageCategorie): string {
  const names: Record<PageCategorie, string> = {
    sante: 'Santé',
    education: 'Éducation',
    administration: 'Administration',
    loisirs: 'Loisirs',
    magasin: 'Magasins',
    marche_local: 'Marché local'
  };

  return names[categorie] || categorie;
}
