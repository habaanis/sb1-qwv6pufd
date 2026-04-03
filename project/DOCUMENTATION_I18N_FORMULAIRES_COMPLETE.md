# Documentation Complète - Système i18n des Formulaires

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Hooks disponibles](#hooks-disponibles)
3. [Traductions de base](#traductions-de-base)
4. [Traductions de catégories](#traductions-de-catégories)
5. [Champ caché submission_lang](#champ-caché-submission_lang)
6. [Exemples complets](#exemples-complets)
7. [Migration de base de données](#migration-de-base-de-données)

---

## Vue d'ensemble

Le système i18n des formulaires supporte 5 langues :
- **fr** - Français
- **en** - Anglais
- **it** - Italien
- **ru** - Russe
- **ar** - Arabe

Tous les formulaires s'adaptent automatiquement à la langue sélectionnée par l'utilisateur.

---

## Hooks disponibles

### 1. useFormTranslation

Hook principal pour traduire les labels, placeholders, boutons et messages.

```tsx
import { useFormTranslation } from '../hooks/useFormTranslation';

const MonFormulaire = () => {
  const {
    label,           // Traduit les labels
    placeholder,     // Traduit les placeholders
    button,          // Traduit les boutons
    message,         // Traduit les messages
    submission_lang  // Langue active (fr, en, it, ru, ar)
  } = useFormTranslation();

  return (
    <div>
      <label>{label('nom')}</label>
      <input placeholder={placeholder('nom')} />
      <button>{button('soumettre')}</button>
    </div>
  );
};
```

### 2. useCategoryTranslation

Hook pour traduire les catégories (entreprises, éducation, santé, etc.).

```tsx
import { useCategoryTranslation } from '../hooks/useCategoryTranslation';

const MonSelect = () => {
  const { getCategory, getAllCategories } = useCategoryTranslation();

  // Une seule catégorie
  const label = getCategory('finance'); // "Finance & services bancaires"

  // Toutes les catégories pour un select
  const categories = getAllCategories([
    'finance',
    'informatique_telecom',
    'conseil_formation'
  ]);

  return (
    <select>
      {categories.map(cat => (
        <option key={cat.value} value={cat.value}>
          {cat.label}
        </option>
      ))}
    </select>
  );
};
```

---

## Traductions de base

### Labels disponibles

```typescript
label('nom')                // Nom / Name / Nome / Фамилия / الاسم
label('prenom')             // Prénom / First Name / Nome di battesimo / Имя / اللقب
label('nom_et_prenom')      // Nom et Prénom / Full Name / Nome completo
label('nom_evenement')      // Nom de l'événement / Event Name
label('titre_evenement')    // Titre de l'événement / Event Title
label('organisateur')       // Organisateur / Organizer
label('ville')              // Ville / City / Città / Город / المدينة
label('gouvernorat')        // Gouvernorat / Governorate / Governatorato / Губернаторство / الولاية
label('date_debut')         // Date de début / Start Date
label('date_fin')           // Date de fin / End Date
label('date_evenement')     // Date de l'événement / Event Date
label('heure')              // Heure / Time / Ora / Время / الوقت
label('prix')               // Prix / Price / Prezzo / Цена / السعر
label('prix_entree')        // Prix d'entrée / Entrance Fee
label('description')        // Description
label('whatsapp')           // WhatsApp / واتساب
label('telephone')          // Téléphone / Phone / Telefono / Телефон / الهاتف
label('email')              // Email / البريد الإلكتروني
label('type_affichage')     // Type d'affichage / Display Type
label('categorie')          // Catégorie / Category / Categoria / Категория / الفئة
label('lien_billetterie')   // Lien billetterie / Ticketing Link
label('adresse')            // Adresse / Address / Indirizzo / Адрес / العنوان
label('site_web')           // Site web / Website / Sito web / Веб-сайт / الموقع الإلكتروني
```

### Placeholders disponibles

Tous les labels ont des placeholders correspondants avec des textes adaptés :

```typescript
placeholder('nom')          // "Entrez le nom" / "Enter name" / "Inserisci il nome"
placeholder('email')        // "exemple@email.com" / "example@email.com"
placeholder('description')  // "Décrivez votre événement..." / "Describe your event..."
```

### Boutons disponibles

```typescript
button('soumettre')   // Soumettre / Submit / Invia / Отправить / إرسال
button('envoyer')     // Envoyer / Send / Inviare / Послать / أرسل
button('inscrire')    // S'inscrire / Register / Iscriviti / Зарегистрироваться / التسجيل
button('confirmer')   // Confirmer / Confirm / Conferma / Подтвердить / تأكيد
button('annuler')     // Annuler / Cancel / Annulla / Отмена / إلغاء
button('retour')      // Retour / Back / Indietro / Назад / رجوع
button('suivant')     // Suivant / Next / Avanti / Далее / التالي
```

### Messages disponibles

```typescript
message('succes')            // Formulaire envoyé avec succès !
message('erreur')            // Une erreur est survenue. Veuillez réessayer.
message('champ_requis')      // Ce champ est requis
message('email_invalide')    // Email invalide
message('telephone_invalide') // Numéro de téléphone invalide
```

---

## Traductions de catégories

### Catégories Entreprises

```typescript
getCategory('finance')                    // Finance & services bancaires
getCategory('services_aux_entreprises')   // Services aux entreprises
getCategory('transport_logistique')       // Transport & logistique
getCategory('btp_construction')           // BTP / Construction
getCategory('industrie')                  // Industrie & fabrication
getCategory('communication_marketing')    // Communication & marketing
getCategory('informatique_telecom')       // Informatique & télécom
getCategory('conseil_formation')          // Conseil & formation
getCategory('evenementiel')               // Événementiel
getCategory('agence_evenementielle')      // Agence événementielle
getCategory('autre_activite_pro')         // Autre activité professionnelle
```

### Catégories Éducation

```typescript
getCategory('ecole_primaire')             // École primaire
getCategory('college_privee')             // Collège privé
getCategory('lycee_privee')               // Lycée privé
getCategory('ecole_privee')               // École privée
getCategory('universites_instituts')      // Universités & Instituts
getCategory('centre_langues')             // Centre de langues
getCategory('centre_soutien')             // Centre de soutien scolaire
getCategory('formation_professionnelle')  // Formation professionnelle
getCategory('etablissement_prive')        // Établissement privé
getCategory('etablissement_public')       // Établissement public
getCategory('formation_adultes')          // Formation pour adultes
```

### Catégories Santé

```typescript
getCategory('ambulance_privee')       // Ambulance privée
getCategory('cabinet_dentaire')       // Cabinet dentaire
getCategory('centre_bien_etre')       // Centre bien-être
getCategory('centre_imagerie')        // Centre d'imagerie
getCategory('centre_medical')         // Centre médical
getCategory('clinique')               // Clinique
getCategory('hopital')                // Hôpital
getCategory('kinesitherapie')         // Kinésithérapie
getCategory('laboratoire_analyses')   // Laboratoire d'analyses
getCategory('ophtalmologie')          // Ophtalmologie
getCategory('pharmacie')              // Pharmacie
getCategory('pharmacie_nuit')         // Pharmacie de nuit
getCategory('polyclinique')           // Polyclinique
getCategory('veterinaire')            // Vétérinaire
```

### Catégories Magasins

```typescript
getCategory('boutique_informatique')  // Boutique informatique
getCategory('telephonie_mobile')      // Téléphonie mobile
getCategory('pret_a_porter')          // Prêt-à-porter
getCategory('vetements_homme')        // Vêtements homme
getCategory('vetements_femme')        // Vêtements femme
getCategory('chaussures')             // Chaussures
getCategory('parfumerie')             // Parfumerie
getCategory('electronique')           // Électronique
getCategory('meubles')                // Meubles
getCategory('salon_coiffure')         // Salon de coiffure
getCategory('restaurant')             // Restaurant
getCategory('cuisine_tunisienne')     // Cuisine tunisienne
// ... et beaucoup d'autres
```

### Catégories Loisirs

```typescript
getCategory('saveurs_traditions')     // Saveurs & Traditions
getCategory('musees_patrimoine')      // Musées & Patrimoine
getCategory('escapades_nature')       // Escapades & Nature
getCategory('festivals_artisanat')    // Festivals & Artisanat
getCategory('sport_aventure')         // Sport & Aventure
```

---

## Champ caché submission_lang

### Méthode 1 : Utilisation du composant

```tsx
import { SubmissionLangField } from '../hooks/useFormTranslation';

const MonFormulaire = () => {
  return (
    <form>
      <SubmissionLangField />
      {/* Reste du formulaire */}
    </form>
  );
};
```

### Méthode 2 : Ajout manuel dans les données

```tsx
import { useFormTranslation } from '../hooks/useFormTranslation';

const MonFormulaire = () => {
  const { submission_lang } = useFormTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      ...formData,
      submission_lang, // Ajoute automatiquement 'fr', 'en', 'it', 'ru', ou 'ar'
    };

    await supabase.from('ma_table').insert([data]);
  };
};
```

---

## Exemples complets

### Exemple 1 : Formulaire simple avec champs de base

```tsx
import React, { useState } from 'react';
import { useFormTranslation } from '../hooks/useFormTranslation';
import { supabase } from '../lib/BoltDatabase';

const SimpleForm = () => {
  const { label, placeholder, button, message, submission_lang } = useFormTranslation();
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('contacts')
        .insert([{
          ...formData,
          submission_lang,
        }]);

      if (error) throw error;
      alert(message('succes'));
    } catch (err) {
      alert(message('erreur'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>{label('nom')} *</label>
        <input
          type="text"
          required
          placeholder={placeholder('nom')}
          value={formData.nom}
          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
        />
      </div>

      <div>
        <label>{label('email')} *</label>
        <input
          type="email"
          required
          placeholder={placeholder('email')}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div>
        <label>{label('telephone')}</label>
        <input
          type="tel"
          placeholder={placeholder('telephone')}
          value={formData.telephone}
          onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? button('envoyer') + '...' : button('soumettre')}
      </button>
    </form>
  );
};

export default SimpleForm;
```

### Exemple 2 : Formulaire avec catégories traduites

```tsx
import React, { useState } from 'react';
import { useFormTranslation } from '../hooks/useFormTranslation';
import { useCategoryTranslation } from '../hooks/useCategoryTranslation';
import { supabase } from '../lib/BoltDatabase';

const EntrepriseForm = () => {
  const { label, placeholder, button, message, submission_lang } = useFormTranslation();
  const { getAllCategories } = useCategoryTranslation();

  const [formData, setFormData] = useState({
    nom: '',
    categorie: '',
    ville: '',
    email: '',
  });

  // Récupère les catégories traduites
  const categories = getAllCategories([
    'finance',
    'services_aux_entreprises',
    'transport_logistique',
    'informatique_telecom',
    'conseil_formation',
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('entreprises')
        .insert([{
          ...formData,
          submission_lang, // Langue de soumission automatique
        }]);

      if (error) throw error;
      alert(message('succes'));
    } catch (err) {
      alert(message('erreur'));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>{label('nom')} *</label>
        <input
          type="text"
          required
          placeholder={placeholder('nom')}
          value={formData.nom}
          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
        />
      </div>

      <div>
        <label>{label('categorie')} *</label>
        <select
          required
          value={formData.categorie}
          onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
        >
          <option value="">-- {label('categorie')} --</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>{label('ville')} *</label>
        <input
          type="text"
          required
          placeholder={placeholder('ville')}
          value={formData.ville}
          onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
        />
      </div>

      <div>
        <label>{label('email')} *</label>
        <input
          type="email"
          required
          placeholder={placeholder('email')}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <button type="submit">{button('soumettre')}</button>
    </form>
  );
};

export default EntrepriseForm;
```

### Exemple 3 : Validation avec messages traduits

```tsx
import React, { useState } from 'react';
import { useFormTranslation } from '../hooks/useFormTranslation';
import { supabase } from '../lib/BoltDatabase';

const ValidatedForm = () => {
  const { label, placeholder, button, message, submission_lang } = useFormTranslation();
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom) {
      newErrors.nom = message('champ_requis');
    }

    if (!formData.email) {
      newErrors.email = message('champ_requis');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = message('email_invalide');
    }

    if (formData.telephone && !/^\+?[0-9\s-]{8,}$/.test(formData.telephone)) {
      newErrors.telephone = message('telephone_invalide');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .insert([{
          ...formData,
          submission_lang,
        }]);

      if (error) throw error;
      alert(message('succes'));
      setFormData({ nom: '', email: '', telephone: '' });
      setErrors({});
    } catch (err) {
      alert(message('erreur'));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>{label('nom')} *</label>
        <input
          type="text"
          placeholder={placeholder('nom')}
          value={formData.nom}
          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
          className={errors.nom ? 'error' : ''}
        />
        {errors.nom && <span className="error-message">{errors.nom}</span>}
      </div>

      <div>
        <label>{label('email')} *</label>
        <input
          type="email"
          placeholder={placeholder('email')}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      <div>
        <label>{label('telephone')}</label>
        <input
          type="tel"
          placeholder={placeholder('telephone')}
          value={formData.telephone}
          onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
          className={errors.telephone ? 'error' : ''}
        />
        {errors.telephone && <span className="error-message">{errors.telephone}</span>}
      </div>

      <button type="submit">{button('soumettre')}</button>
    </form>
  );
};

export default ValidatedForm;
```

---

## Migration de base de données

Pour ajouter la colonne `submission_lang` à vos tables :

```sql
ALTER TABLE ma_table
ADD COLUMN IF NOT EXISTS submission_lang TEXT DEFAULT 'fr';
```

Ou utilisez la fonction Supabase :

```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ma_table' AND column_name = 'submission_lang'
  ) THEN
    ALTER TABLE ma_table ADD COLUMN submission_lang TEXT DEFAULT 'fr';
  END IF;
END $$;
```

---

## Notes importantes

1. **Changement de langue instantané** - Les formulaires s'adaptent automatiquement sans rechargement
2. **Valeurs techniques conservées** - Les `value` des selects restent en format technique (ex: `finance`)
3. **Labels traduits** - Seuls les labels affichés sont traduits
4. **Fallback français** - Si une traduction manque, le français est utilisé par défaut
5. **Compatibilité RTL** - L'arabe est géré avec RTL automatique via le contexte

---

## Formulaires à mettre à jour

- [x] LeisureEventProposalForm.tsx ✅
- [ ] RegistrationForm.tsx
- [ ] QuoteForm.tsx
- [ ] AnnouncementForm.tsx
- [ ] EntrepriseAvisForm.tsx
- [ ] AlerteRechercheForm.tsx
- [ ] MedicalTransportRegistrationForm.tsx
- [ ] EducationEventForm.tsx
- [ ] AvisForm.tsx
- [ ] CandidateForm.tsx
- [ ] JobPostForm.tsx

---

## Support

Pour toute question ou ajout de nouvelles clés :
- `src/hooks/useFormTranslation.ts` - Traductions de base
- `src/hooks/useCategoryTranslation.ts` - Traductions de catégories
- `src/context/LanguageContext.tsx` - Contexte de langue
- `src/lib/i18n.ts` - Système i18n principal
