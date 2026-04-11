// src/lib/searchSynonyms.ts
import type { Lang } from './i18n';

/* =========================
   Normalisation multi-langue
   ========================= */
export const stripAccents = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // accents latins (éêà… → eea)

const stripArabicDiacritics = (s: string) =>
  (s || '').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, ''); // harakat

export const norm = (s: string, lang: Lang) => {
  let out = stripAccents(s || '');
  if (lang === 'ar') out = stripArabicDiacritics(out);
  return out.trim();
};

export const MIN_CHARS = 2;

/* =========================
   Synonymes étendus (FR/EN/IT/RU/AR)
   Catégories: santé, éducation, administration, loisirs, magasin, marché local
   ========================= */
export const SYNONYMS: Record<Lang, Record<string, string[]>> = {
  fr: {
    // Santé
    'hôpital': ['hopital', 'clinique', 'urgence', 'centre hospitalier'],
    'hopital': ['hôpital', 'clinique', 'urgence', 'centre hospitalier'],
    'médecin': ['docteur', 'médecin généraliste', 'cabinet médical', 'consultation', 'clinique'],
    'dentiste': ['dentaire', 'orthodontiste', 'cabinet dentaire', 'implant dentaire'],
    'pharmacie': ['para-pharmacie', 'drugstore', 'médicaments', 'pharmacie de garde'],
    'kiné': ['kinésithérapeute', 'physiothérapeute', 'rééducation'],
    'ophtalmo': ['ophtalmologue', 'opticien', 'lunettes'],
    'pédiatre': ['médecin pour enfants', 'pédiatrie'],

    // Éducation
    'école': ['maternelle', 'primaire', 'collège', 'lycée', 'université', 'institut', 'académie'],
    'cours': ['formation', 'tutorat', 'stage', 'apprentissage', 'centre de formation'],
    'professeur': ['enseignant', 'maître', 'formateur'],

    // Administration
    'mairie': ['municipalité', 'hôtel de ville'],
    'carte': ['carte identité', 'cin', 'passeport', 'titre de séjour'],
    'impôts': ['taxes', 'fiscalité', 'cnss', 'sécurité sociale'],
    'préfecture': ['gouvernorat', 'délégation', 'consulat'],

    // Loisirs
    'resto': ['restaurant', 'snack', 'café', 'fast-food'],
    'ciné': ['cinéma', 'film', 'projection'],
    'parc': ['jardin', 'aire de jeux'],
    'gym': ['fitness', 'salle de sport'],
    'hôtel': ['hébergement', 'auberge'],

    // Magasin
    'chaussure': ['chaussures', 'souliers', 'sneakers'],
    'vêtements': ['prêt-à-porter', 'habillement', 'boutique'],
    'épicerie': ['alimentation', 'supérette', 'supermarché'],
    'informatique': ['électronique', 'téléphones', 'pc'],
    'quincaillerie': ['bricolage', 'outillage'],
    'beauté': ['esthétique', 'esthéticienne', 'coiffure', 'spa', 'bien-être'],
    'coiffure': ['coiffeur', 'salon', 'barbier'],

    // Marché local
    'marché': ['souk', 'foire', 'bazar', 'produits locaux', 'artisanat'],
    'brocante': ['antiquités', 'seconde main'],
    'pâtisserie': ['boulangerie', 'gâteaux'],
    'garage': ['garagiste', 'auto', 'mécanique', 'atelier auto'],
  },

  en: {
    // Health
    'hospital': ['clinic', 'emergency', 'er', 'medical center'],
    'doctor': ['physician', 'gp', 'medical office', 'consultation', 'clinic'],
    'dentist': ['dental', 'orthodontist', 'dental clinic', 'implant'],
    'pharmacy': ['drugstore', 'medicines', 'on-call pharmacy'],
    'physio': ['physiotherapist', 'rehab', 'kinesitherapy'],
    'ophthalmologist': ['optician', 'glasses', 'eye doctor'],
    'pediatrician': ['kids doctor', 'pediatrics'],

    // Education
    'school': ['kindergarten', 'primary', 'middle school', 'high school', 'university', 'institute', 'academy'],
    'course': ['training', 'tutoring', 'internship', 'apprenticeship', 'training center'],
    'teacher': ['professor', 'instructor'],

    // Administration
    'city hall': ['municipality', 'town hall'],
    'id card': ['passport', 'residence permit'],
    'tax': ['taxes', 'cnss', 'social security'],
    'prefecture': ['governorate', 'delegation', 'consulate'],

    // Leisure
    'restaurant': ['cafe', 'snack', 'fast food', 'bistro'],
    'cinema': ['movie', 'projection'],
    'park': ['garden', 'playground'],
    'gym': ['fitness', 'sports club'],
    'hotel': ['accommodation', 'hostel'],

    // Shop
    'shoes': ['footwear', 'sneakers'],
    'clothes': ['apparel', 'boutique'],
    'grocery': ['food', 'mini market', 'supermarket'],
    'hardware': ['diy', 'tools'],
    'electronics': ['computers', 'phones'],
    'beauty': ['esthetic', 'spa', 'hair', 'salon'],

    // Local market
    'market': ['bazaar', 'fair', 'local products', 'handicraft'],
    'thrift': ['second hand', 'vintage', 'flea'],
    'bakery': ['pastry', 'cakes'],
    'garage': ['mechanic', 'auto repair', 'workshop'],
  },

  it: {
    // Salute
    'ospedale': ['clinica', 'pronto soccorso', 'centro medico'],
    'medico': ['dottore', 'medico di base', 'ambulatorio', 'clinica'],
    'dentista': ['dentale', 'ortodontista', 'studio dentistico', 'impianto'],
    'farmacia': ['parafarmacia', 'medicinali', 'farmacia di turno'],
    'fisioterapista': ['riabilitazione', 'kinesiterapia'],
    'oculista': ['ottico', 'occhiali'],
    'pediatra': ['medico per bambini', 'pediatria'],

    // Istruzione
    'scuola': ['asilo', 'elementari', 'medie', 'liceo', 'università', 'istituto', 'accademia'],
    'corso': ['formazione', 'ripetizioni', 'tirocinio', 'apprendistato', 'centro di formazione'],
    'insegnante': ['professore', 'formatore'],

    // Amministrazione
    'comune': ['municipio', 'municipalità'],
    'carta': ["carta d'identità", 'passaporto', 'permesso di soggiorno'],
    'tasse': ['imposte', 'fisco', 'previdenza sociale'],
    'prefettura': ['governatorato', 'consolato'],

    // Tempo libero
    'ristorante': ['trattoria', 'caffè', 'fast food'],
    'cinema': ['film', 'proiezione'],
    'parco': ['giardino', 'area giochi'],
    'palestra': ['fitness', 'sport'],
    'hotel': ['alloggio', 'ostello'],

    // Negozio
    'scarpe': ['calzature', 'sneakers'],
    'abbigliamento': ['vestiti', 'boutique'],
    'alimentari': ['drogheria', 'supermercato', 'minimarket'],
    'ferramenta': ['bricolage', 'utensili'],
    'elettronica': ['computer', 'telefoni'],
    'bellezza': ['estetica', 'parrucchiere', 'spa'],

    // Mercato locale
    'mercato': ['bazar', 'fiera', 'prodotti locali', 'artigianato'],
    'usato': ['second hand', 'vintage', 'mercatino'],
    'pasticceria': ['panetteria', 'dolci'],
    'officina': ['meccanico', 'auto', 'officina meccanica'],
  },

  ru: {
    // Здоровье
    'больница': ['клиника', 'скорая', 'медцентр'],
    'врач': ['доктор', 'терапевт', 'клиника', 'прием'],
    'стоматолог': ['дантист', 'стоматология', 'ортодонт', 'имплант'],
    'аптека': ['drugstore', 'лекарства', 'дежурная аптека'],
    'физиотерапевт': ['реабилитация', 'кинезитерапия'],
    'офтальмолог': ['окулист', 'оптик', 'очки'],
    'педиатр': ['детский врач', 'педиатрия'],

    // Образование
    'школа': ['детский сад', 'начальная', 'средняя', 'лицей', 'университет', 'институт', 'академия'],
    'курсы': ['обучение', 'репетитор', 'стажировка', 'учебный центр'],
    'учитель': ['преподаватель', 'лектор'],

    // Администрация
    'мэрия': ['муниципалитет', 'ратуша'],
    'паспорт': ['удостоверение личности', 'вид на жительство'],
    'налоги': ['фиск', 'соцстрах'],
    'префектура': ['губернаторство', 'консульство'],

    // Досуг
    'ресторан': ['кафе', 'закусочная', 'фастфуд'],
    'кино': ['кинотеатр', 'фильм', 'сеанс'],
    'парк': ['сад', 'детская площадка'],
    'спортзал': ['фитнес', 'клуб'],
    'отель': ['гостиница', 'хостел'],

    // Магазин
    'обувь': ['ботинки', 'кроссовки'],
    'одежда': ['бутик', 'магазин одежды'],
    'продукты': ['бакалея', 'супермаркет', 'минимаркет'],
    'хозтовары': ['инструменты', 'диайвай'],
    'электроника': ['компьютеры', 'телефоны'],
    'красота': ['эстетика', 'салон', 'спа', 'парикмахер'],

    // Местный рынок
    'рынок': ['базар', 'ярмарка', 'местные продукты', 'ремесла'],
    'секонд-хенд': ['вторичные вещи', 'винтаж', 'блошиный рынок'],
    'пекарня': ['кондитерская', 'выпечка'],
    'гараж': ['автосервис', 'механик', 'мастерская'],
  },

  ar: {
    // الصحة
    'مستشفى': ['عيادة', 'طوارئ', 'مركز طبي'],
    'طبيب': ['دكتور', 'طبيب عام', 'عيادة', 'استشارة'],
    'طبيب أسنان': ['أسنان', 'عيادة أسنان', 'تقويم', 'زرع أسنان'],
    'صيدلية': ['دواء', 'صيدلية مناوبة'],
    'علاج طبيعي': ['فزيوتيرابي', 'تأهيل', 'كينيزيتيرابي'],
    'عيون': ['طبيب عيون', 'نظارات', 'بصريات'],
    'طبيب أطفال': ['أطفال', 'طب الأطفال'],

    // التعليم
    'مدرسة': ['روضة', 'ابتدائي', 'إعدادي', 'ثانوي', 'جامعة', 'معهد', 'أكاديمية'],
    'دورة': ['تدريب', 'دروس خصوصية', 'تربص', 'مركز تكوين'],
    'معلم': ['أستاذ', 'مدرب'],

    // الإدارة
    'بلدية': ['معتمدية', 'دار البلدية'],
    'بطاقة': ['بطاقة تعريف', 'جواز سفر', 'إقامة'],
    'ضرائب': ['جباية', 'صندوق الضمان الاجتماعي'],
    'ولاية': ['محافظة', 'قنصلية'],

    // ترفيه
    'مطعم': ['مقهى', 'وجبات سريعة', 'سناك'],
    'سينما': ['فيلم', 'عرض'],
    'حديقة': ['منتزه', 'ملعب أطفال'],
    'نادي رياضي': ['جيم', 'فتنس'],
    'فندق': ['نزل', 'إقامة'],

    // متجر
    'أحذية': ['سبادري', 'أحذية رياضية', 'كوتشي'],
    'ملابس': ['بوتيك', 'ألبسة'],
    'بقالة': ['مواد غذائية', 'سوبرات', 'سوبرماركت'],
    'أدوات': ['عتاد', 'بريكولاج'],
    'إلكترونيات': ['حواسيب', 'هواتف'],
    'تجميل': ['جمال', 'صالون', 'سبا', 'حلاقة'],

    // السوق المحلي
    'سوق': ['بازار', 'معرض', 'منتجات محلية', 'صناعات تقليدية'],
    'مستعمل': ['قديم', 'فنتاج', 'سوق البرغوث'],
    'حلويات': ['مخبوزات', 'باتيسري'],
    'كراج': ['ميكانيكي', 'ورشة', 'تصليح سيارات'],
  },
};

/* =========================
   Raccourcis "stems" (2–3 lettres)
   ========================= */
const STEMS_ALL: Record<Lang, Record<string, string[]>> = {
  fr: {
    'hop': ['hôpital', 'hopital', 'clinique', 'urgence'],
    'gar': ['garage', 'garagiste', 'auto', 'mécanique'],
    'bea': ['beauté', 'esthétique', 'spa', 'coiffure'],
    'den': ['dentiste', 'dentaire', 'orthodontiste'],
    'med': ['médecin', 'docteur', 'clinique', 'cabinet médical'],
    'coi': ['coiffure', 'coiffeur', 'salon', 'barbier'],
  },
  en: {
    'hos': ['hospital', 'clinic', 'emergency'],
    'gar': ['garage', 'mechanic', 'auto repair'],
    'bea': ['beauty', 'esthetic', 'spa', 'hair'],
    'den': ['dentist', 'dental', 'orthodontist'],
    'doc': ['doctor', 'physician', 'clinic'],
    'hai': ['hair', 'barber', 'salon'],
  },
  it: {
    'osp': ['ospedale', 'clinica', 'pronto soccorso'],
    'off': ['officina', 'meccanico', 'auto'],
    'bel': ['bellezza', 'estetica', 'spa', 'parrucchiere'],
    'den': ['dentista', 'dentale', 'ortodontista'],
    'med': ['medico', 'dottore', 'clinica'],
    'par': ['parrucchiere', 'barbiere', 'salone'],
  },
  ru: {
    'bol': ['больница', 'клиника', 'скорая'],
    'gar': ['гараж', 'автосервис', 'механик'],
    'kra': ['красота', 'эстетика', 'салон', 'спа'],
    'sto': ['стоматолог', 'стоматология', 'ортодонт'],
    'vra': ['врач', 'доктор', 'клиника'],
    'par': ['парикмахер', 'салон', 'барбер'],
  },
  ar: {
    'mus': ['مستشفى', 'عيادة', 'طوارئ'],
    'kra': ['كراج', 'ميكانيكي', 'ورشة'],
    'jam': ['جميل', 'تجميل', 'سبا', 'صالون'],
    'asn': ['أسنان', 'طبيب أسنان', 'عيادة أسنان'],
    'tbb': ['طبيب', 'دكتور', 'عيادة'],
    'hlq': ['حلاق', 'صالون', 'باربر'],
  },
};

function expandStems(q: string, lang: Lang): string[] {
  const s = (q || '').toLowerCase().trim();
  if (s.length < 2 || s.length > 3) return [];
  const stems = STEMS_ALL[lang] || STEMS_ALL['fr'];
  return stems[s] || [];
}

/* =========================
   Équivalences inter-langues (optionnelles)
   ========================= */
export const ENABLE_CROSS_LANG = true;

const CROSS_LANG_GROUPS: Array<Partial<Record<Lang, string[]>>> = [
  { fr: ['hôpital', 'hopital'], en: ['hospital'], it: ['ospedale'], ru: ['больница'], ar: ['مستشفى'] },
  { fr: ['médecin', 'docteur'], en: ['doctor', 'physician'], it: ['medico', 'dottore'], ru: ['врач', 'доктор'], ar: ['طبيب', 'دكتور'] },
  { fr: ['dentiste'], en: ['dentist'], it: ['dentista'], ru: ['стоматолог'], ar: ['طبيب أسنان'] },
  { fr: ['pharmacie'], en: ['pharmacy', 'drugstore'], it: ['farmacia'], ru: ['аптека'], ar: ['صيدلية'] },
  { fr: ['restaurant', 'resto'], en: ['restaurant', 'cafe'], it: ['ristorante', 'caffè'], ru: ['ресторан', 'кафе'], ar: ['مطعم', 'مقهى'] },
  { fr: ['école'], en: ['school'], it: ['scuola'], ru: ['школа'], ar: ['مدرسة'] },
  { fr: ['chaussure', 'chaussures'], en: ['shoes', 'footwear'], it: ['scarpe', 'calzature'], ru: ['обувь'], ar: ['أحذية'] },
  { fr: ['marché', 'souk'], en: ['market', 'bazaar'], it: ['mercato', 'bazar'], ru: ['рынок', 'базар'], ar: ['سوق', 'بازار'] },
];

function expandCrossLingual(q: string, lang: Lang): string[] {
  const nq = norm(q, lang);
  const out: string[] = [];
  for (const group of CROSS_LANG_GROUPS) {
    const match = (Object.entries(group) as Array<[Lang, string[]]>).some(([L, arr]) =>
      arr?.some(v => {
        const nv = norm(v, L);
        return nv.includes(nq) || nq.includes(nv);
      })
    );
    if (match) {
      (Object.entries(group) as Array<[Lang, string[]]>).forEach(([_, arr]) => {
        arr?.forEach(v => out.push(v));
      });
    }
  }
  return out;
}

/* =========================
   API principale
   ========================= */
export function expandQuery(q: string, lang: Lang): string[] {
  const nq = norm(q, lang);
  const list = new Set<string>([q]); // garde l'original pour l'affichage

  // 1) synonymes de la langue courante
  const syn = SYNONYMS[lang] || {};
  for (const [k, variants] of Object.entries(syn)) {
    if (nq.includes(norm(k, lang))) variants.forEach(v => list.add(v));
  }

  // 2) stems très courts (2–3 lettres)
  expandStems(q, lang).forEach(v => list.add(v));

  // 3) inter-langues (optionnel)
  if (ENABLE_CROSS_LANG) {
    expandCrossLingual(q, lang).forEach(v => list.add(v));
  }

  return Array.from(list);
}

/* =========================
   Petit util de ranking côté client
   (préfixe > mot commence > ville > contient)
   ========================= */
export function rankItemByQuery(item: any, q: string, lang: Lang) {
  const nq = norm(q, lang);
  const nNom = norm(item?.nom || '', lang);
  const nVille = norm(item?.ville || '', lang);
  const nCategory = norm(item?.matiere || item?.categorie || '', lang);
  const words = nNom.split(/\s+/);

  if (nNom.startsWith(nq)) return 0;
  if (words.some(w => w.startsWith(nq))) return 1;
  if (nCategory.startsWith(nq)) return 2;
  if (nVille.startsWith(nq)) return 3;
  if (nNom.includes(nq)) return 4;
  if (nCategory.includes(nq)) return 5;
  return 9;
}
