# Guide Complet - Formulaires Multilingues avec i18n

## Vue d'ensemble

Tous les formulaires du projet sont maintenant **totalement multilingues** avec une automatisation complète pour WhaleSync/Airtable.

**5 langues supportées** : Français (FR), Anglais (EN), Italien (IT), Russe (RU), Arabe (AR)

---

## 1. Architecture du système

### 1.1 Flux de données

```
Utilisateur change langue
    ↓
LanguageContext.language = 'en'
    ↓
Formulaire détecte la langue (useFormTranslation)
    ↓
Labels/Placeholders traduits automatiquement
    ↓
Soumission avec champ "langue" = language
    ↓
Supabase stocke la langue
    ↓
WhaleSync synchronise vers Airtable
    ↓
Tri automatique dans Airtable par langue
```

### 1.2 Hooks disponibles

#### `useFormTranslation()`

**Fichier** : `src/hooks/useFormTranslation.ts`

```tsx
import { useFormTranslation } from '../hooks/useFormTranslation';

const { label, placeholder, button, message, submission_lang } = useFormTranslation();

// Utilisation
<label>{label('nom')}</label>
<input placeholder={placeholder('nom')} />
<button>{button('soumettre')}</button>
alert(message('succes'));
```

**Retourne** :
- `label(key)` - Traduit les labels (30+ clés)
- `placeholder(key)` - Traduit les placeholders
- `button(key)` - Traduit les boutons
- `message(key)` - Traduit les messages
- `submission_lang` - Langue active ('fr', 'en', 'it', 'ru', 'ar')
- `language` - Alias de submission_lang

#### `useFormSubmit(options)`

**Fichier** : `src/hooks/useFormSubmit.ts`

Hook générique pour centraliser la soumission de formulaires avec injection automatique de la langue.

```tsx
import { useFormSubmit } from '../hooks/useFormSubmit';

const { submit, isSubmitting, error, submission_lang } = useFormSubmit({
  tableName: 'inscriptions_loisirs',
  onSuccess: () => console.log('Succès !'),
  onError: (err) => console.error(err),
  showAlert: true,
  validateData: (data) => !!data.nom && !!data.email,
});

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const result = await submit({
    nom: formData.nom,
    email: formData.email,
    // langue et submission_lang ajoutés automatiquement
  });

  if (result.success) {
    // Réinitialiser le formulaire
  }
};
```

**Options** :
- `tableName` (requis) - Nom de la table Supabase
- `onSuccess` (optionnel) - Callback en cas de succès
- `onError` (optionnel) - Callback en cas d'erreur
- `showAlert` (optionnel) - Afficher alert() automatique (défaut: true)
- `validateData` (optionnel) - Fonction de validation avant envoi

**Retourne** :
- `submit(data)` - Fonction pour envoyer les données
- `isSubmitting` - État de soumission (boolean)
- `error` - Message d'erreur (string | null)
- `submission_lang` - Langue active pour le formulaire
- `language` - Alias de submission_lang

**Données envoyées automatiquement** :
```tsx
{
  ...vos_donnees,
  langue: 'fr',           // Pour WhaleSync/Airtable
  submission_lang: 'fr',  // Pour traçabilité interne
}
```

#### `useCategoryTranslation()`

**Fichier** : `src/hooks/useCategoryTranslation.ts`

```tsx
import { useCategoryTranslation } from '../hooks/useCategoryTranslation';

const { getCategory, getAllCategories } = useCategoryTranslation();

// Une catégorie
const label = getCategory('finance'); // "Finance & services bancaires"

// Plusieurs catégories pour un <select>
const categories = getAllCategories(['finance', 'informatique_telecom', 'sante']);

<select>
  {categories.map(cat => (
    <option key={cat.value} value={cat.value}>
      {cat.label}
    </option>
  ))}
</select>
```

**70+ catégories disponibles** :
- Entreprises (11) : finance, services_aux_entreprises, informatique_telecom, etc.
- Éducation (11) : ecole_primaire, college_privee, formation_professionnelle, etc.
- Santé (14) : clinique, pharmacie, cabinet_dentaire, laboratoire_analyses, etc.
- Magasins (30+) : boutique_informatique, restaurant, cafe, salon_coiffure, etc.
- Loisirs (5) : saveurs_traditions, musees_patrimoine, sport_aventure, etc.

---

## 2. Implémentation dans un formulaire

### 2.1 Exemple complet avec useFormSubmit (recommandé)

```tsx
import React, { useState } from 'react';
import { useFormSubmit } from '../hooks/useFormSubmit';
import { useFormTranslation } from '../hooks/useFormTranslation';
import { useCategoryTranslation } from '../hooks/useCategoryTranslation';

const MonFormulaire = () => {
  const { label, placeholder, button, message } = useFormTranslation();
  const { getAllCategories } = useCategoryTranslation();

  const { submit, isSubmitting, submission_lang } = useFormSubmit({
    tableName: 'inscriptions_loisirs',
    onSuccess: () => {
      setFormData({ nom: '', email: '', categorie: '' });
    },
    validateData: (data) => {
      if (!data.nom || !data.email) {
        alert(message('champ_requis'));
        return false;
      }
      if (!data.email.includes('@')) {
        alert(message('email_invalide'));
        return false;
      }
      return true;
    },
  });

  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    categorie: '',
  });

  const categories = getAllCategories(['finance', 'informatique_telecom', 'sante']);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6">
      <h2 className="text-2xl mb-6">
        {label('titre_evenement')}
      </h2>

      {/* Champ Nom */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">
          {label('nom')} *
        </label>
        <input
          type="text"
          required
          placeholder={placeholder('nom')}
          value={formData.nom}
          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Champ Email */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">
          {label('email')} *
        </label>
        <input
          type="email"
          required
          placeholder={placeholder('email')}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Champ Catégorie */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">
          {label('categorie')} *
        </label>
        <select
          required
          value={formData.categorie}
          onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
          className="w-full p-2 border rounded"
        >
          <option value="">-- {label('categorie')} --</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Indicateur de langue (debug) */}
      <div className="text-sm text-gray-500 mb-4">
        Langue: {submission_lang}
      </div>

      {/* Bouton de soumission */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? '...' : button('soumettre')}
      </button>
    </form>
  );
};

export default MonFormulaire;
```

### 2.2 Exemple avec soumission manuelle

```tsx
import React, { useState } from 'react';
import { useFormTranslation } from '../hooks/useFormTranslation';
import { supabase } from '../lib/supabaseClient';

const MonFormulaireManuel = () => {
  const { label, placeholder, button, message, submission_lang } = useFormTranslation();
  const [formData, setFormData] = useState({ nom: '', email: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('ma_table')
        .insert([{
          ...formData,
          langue: submission_lang,        // Pour WhaleSync
          submission_lang: submission_lang, // Pour traçabilité
        }]);

      if (error) throw error;

      alert(message('succes'));
      setFormData({ nom: '', email: '' });
    } catch (err) {
      console.error(err);
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

export default MonFormulaireManuel;
```

---

## 3. Clés de traduction disponibles

### 3.1 Labels (labels)

```tsx
label('nom')              // "Nom" / "Name" / "Nome" / "Фамилия" / "الاسم"
label('prenom')           // "Prénom" / "First Name" / "Nome di battesimo" / "Имя" / "اللقب"
label('nom_et_prenom')    // "Nom et Prénom" / "Full Name" / ...
label('nom_evenement')    // "Nom de l'événement" / "Event Name" / ...
label('titre_evenement')  // "Titre de l'événement" / "Event Title" / ...
label('organisateur')     // "Organisateur" / "Organizer" / ...
label('ville')            // "Ville" / "City" / "Città" / "Город" / "المدينة"
label('gouvernorat')      // "Gouvernorat" / "Governorate" / ...
label('date_debut')       // "Date de début" / "Start Date" / ...
label('date_fin')         // "Date de fin" / "End Date" / ...
label('date_evenement')   // "Date de l'événement" / "Event Date" / ...
label('heure')            // "Heure" / "Time" / "Ora" / "Время" / "الوقت"
label('prix')             // "Prix" / "Price" / "Prezzo" / "Цена" / "السعر"
label('prix_entree')      // "Prix d'entrée" / "Entrance Fee" / ...
label('description')      // "Description" / "Description" / ...
label('whatsapp')         // "WhatsApp" / "WhatsApp" / ...
label('telephone')        // "Téléphone" / "Phone" / "Telefono" / "Телефон" / "الهاتف"
label('email')            // "Email" / "Email" / ...
label('type_affichage')   // "Type d'affichage" / "Display Type" / ...
label('categorie')        // "Catégorie" / "Category" / "Categoria" / "Категория" / "الفئة"
label('lien_billetterie') // "Lien billetterie" / "Ticketing Link" / ...
label('adresse')          // "Adresse" / "Address" / "Indirizzo" / "Адрес" / "العنوان"
label('site_web')         // "Site web" / "Website" / "Sito web" / "Веб-сайт" / "الموقع الإلكتروني"
```

### 3.2 Placeholders (placeholders)

```tsx
placeholder('nom')              // "Entrez le nom" / "Enter name" / ...
placeholder('email')            // "exemple@email.com" / "example@email.com" / ...
placeholder('telephone')        // "Ex: +216 XX XXX XXX" / "E.g.: +216 XX XXX XXX" / ...
placeholder('prix')             // "Ex: 50 TND" / "E.g.: 50 TND" / ...
placeholder('description')      // "Décrivez votre événement en détail..." / "Describe your event in detail..." / ...
```

### 3.3 Boutons (buttons)

```tsx
button('soumettre')  // "Soumettre" / "Submit" / "Invia" / "Отправить" / "إرسال"
button('envoyer')    // "Envoyer" / "Send" / "Inviare" / "Послать" / "أرسل"
button('inscrire')   // "S'inscrire" / "Register" / "Iscriviti" / "Зарегистрироваться" / "التسجيل"
button('confirmer')  // "Confirmer" / "Confirm" / "Conferma" / "Подтвердить" / "تأكيد"
button('annuler')    // "Annuler" / "Cancel" / "Annulla" / "Отмена" / "إلغاء"
button('retour')     // "Retour" / "Back" / "Indietro" / "Назад" / "رجوع"
button('suivant')    // "Suivant" / "Next" / "Avanti" / "Далее" / "التالي"
```

### 3.4 Messages (messages)

```tsx
message('succes')             // "Formulaire envoyé avec succès !" / "Form submitted successfully!" / ...
message('erreur')             // "Une erreur est survenue. Veuillez réessayer." / "An error occurred. Please try again." / ...
message('champ_requis')       // "Ce champ est requis" / "This field is required" / ...
message('email_invalide')     // "Email invalide" / "Invalid email" / ...
message('telephone_invalide') // "Numéro de téléphone invalide" / "Invalid phone number" / ...
```

---

## 4. Validation des formulaires

### 4.1 Validation avec useFormSubmit

```tsx
const { submit } = useFormSubmit({
  tableName: 'ma_table',
  validateData: (data) => {
    // Champs requis
    if (!data.nom || !data.email) {
      return false; // message('champ_requis') affiché automatiquement
    }

    // Email valide
    if (!data.email.includes('@')) {
      return false;
    }

    // Téléphone valide (optionnel)
    if (data.telephone && !/^\+?[\d\s-]+$/.test(data.telephone)) {
      return false;
    }

    return true;
  },
});
```

### 4.2 Validation manuelle avec messages traduits

```tsx
const { message } = useFormTranslation();

const validateForm = () => {
  if (!formData.nom) {
    alert(message('champ_requis'));
    return false;
  }

  if (!formData.email || !formData.email.includes('@')) {
    alert(message('email_invalide'));
    return false;
  }

  if (formData.telephone && !/^\+?[\d\s-]+$/.test(formData.telephone)) {
    alert(message('telephone_invalide'));
    return false;
  }

  return true;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  // Continuer la soumission...
};
```

---

## 5. Tables Supabase avec support multilingue

Toutes ces tables ont la colonne `submission_lang` (TEXT, DEFAULT 'fr') :

| Table | Statut | Formulaire associé |
|-------|--------|-------------------|
| inscriptions_loisirs | ✅ | LeisureEventProposalForm |
| partner_requests | ✅ | PartnerSearch |
| suggestions_entreprises | ✅ | SuggestionEntrepriseModal |
| demande_devis | ✅ | QuoteForm |
| evenements_scolaire | ✅ | EducationEventForm |
| inquiries | ✅ | Formulaires de contact |
| candidates | ✅ | CandidateForm |
| job_postings | ✅ | JobPostForm |
| avis_entreprise | ✅ | EntrepriseAvisForm |
| projets_services_b2b | ✅ | B2B Forms |
| evenements_locaux | ✅ | Événements locaux |
| evenements_culturels | ✅ | Événements culturels |

---

## 6. Intégration WhaleSync/Airtable

### 6.1 Format des données envoyées

Chaque soumission de formulaire inclut automatiquement :

```json
{
  "nom": "John Doe",
  "email": "john@example.com",
  "categorie": "finance",
  "langue": "en",
  "submission_lang": "en"
}
```

**Important** :
- `langue` : Champ principal pour WhaleSync (synchronisation Airtable)
- `submission_lang` : Champ de traçabilité interne Supabase
- Valeurs possibles : `'fr'`, `'en'`, `'it'`, `'ru'`, `'ar'`

### 6.2 Catégories : Labels vs Values

**Labels affichés** (traduits) :
- FR : "Finance & services bancaires"
- EN : "Finance & Banking Services"
- IT : "Finanza e servizi bancari"
- RU : "Финансы и банковские услуги"
- AR : "المالية والخدمات المصرفية"

**Value envoyée** (technique) :
- Toujours : `"finance"`

**Pourquoi ?**
- Les filtres Airtable utilisent les valeurs techniques
- Compatibilité avec les automatisations existantes
- Pas de casse des règles de tri/filtrage

```tsx
// Exemple
<select value={formData.categorie} onChange={...}>
  {categories.map(cat => (
    <option
      key={cat.value}
      value={cat.value}  // "finance" (technique)
    >
      {cat.label}          // "Finance & services bancaires" (traduit)
    </option>
  ))}
</select>
```

---

## 7. Messages de confirmation dans les 5 langues

### 7.1 Succès

| Langue | Message |
|--------|---------|
| FR | Formulaire envoyé avec succès ! |
| EN | Form submitted successfully! |
| IT | Modulo inviato con successo! |
| RU | Форма успешно отправлена! |
| AR | تم إرسال النموذج بنجاح! |

### 7.2 Erreur

| Langue | Message |
|--------|---------|
| FR | Une erreur est survenue. Veuillez réessayer. |
| EN | An error occurred. Please try again. |
| IT | Si è verificato un errore. Riprova. |
| RU | Произошла ошибка. Пожалуйста, попробуйте снова. |
| AR | حدث خطأ. يرجى المحاولة مرة أخرى. |

### 7.3 Champ requis

| Langue | Message |
|--------|---------|
| FR | Ce champ est requis |
| EN | This field is required |
| IT | Questo campo è obbligatorio |
| RU | Это поле обязательно |
| AR | هذا الحقل مطلوب |

### 7.4 Email invalide

| Langue | Message |
|--------|---------|
| FR | Email invalide |
| EN | Invalid email |
| IT | Email non valida |
| RU | Неверный email |
| AR | بريد إلكتروني غير صالح |

---

## 8. Changement de langue en temps réel

Le système détecte automatiquement la langue active et met à jour tous les formulaires **sans rechargement de page**.

### 8.1 Sélecteur de langue

```tsx
import { useLanguage } from '../context/LanguageContext';

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
    >
      <option value="fr">Français</option>
      <option value="en">English</option>
      <option value="it">Italiano</option>
      <option value="ru">Русский</option>
      <option value="ar">العربية</option>
    </select>
  );
};
```

### 8.2 Réactivité automatique

Tous les composants utilisant `useFormTranslation()` ou `useFormSubmit()` se mettent à jour automatiquement quand la langue change.

```tsx
// Avant changement (FR)
<label>Nom</label>
<button>Soumettre</button>

// Après changement vers EN
<label>Name</label>
<button>Submit</button>

// Données envoyées
{ langue: 'en', submission_lang: 'en' }
```

---

## 9. Ajouter une nouvelle clé de traduction

### 9.1 Éditer useFormTranslation.ts

```tsx
// src/hooks/useFormTranslation.ts

export const formTranslations: Record<Language, {...}> = {
  fr: {
    labels: {
      // ... existant
      ma_nouvelle_cle: 'Mon nouveau label',
    },
    placeholders: {
      // ... existant
      ma_nouvelle_cle: 'Mon nouveau placeholder',
    },
  },
  en: {
    labels: {
      // ... existant
      ma_nouvelle_cle: 'My new label',
    },
    placeholders: {
      // ... existant
      ma_nouvelle_cle: 'My new placeholder',
    },
  },
  // Répéter pour it, ru, ar
};
```

### 9.2 Utiliser la nouvelle clé

```tsx
const { label, placeholder } = useFormTranslation();

<label>{label('ma_nouvelle_cle')}</label>
<input placeholder={placeholder('ma_nouvelle_cle')} />
```

---

## 10. Best Practices

### ✅ À FAIRE

1. **Toujours utiliser les hooks de traduction**
   ```tsx
   const { label, placeholder, button, message } = useFormTranslation();
   ```

2. **Utiliser useFormSubmit pour les nouveaux formulaires**
   ```tsx
   const { submit, isSubmitting } = useFormSubmit({ tableName: 'ma_table' });
   ```

3. **Ajouter langue dans les données Supabase**
   ```tsx
   { ...formData, langue: submission_lang, submission_lang }
   ```

4. **Utiliser des valeurs techniques pour les catégories**
   ```tsx
   <option value="finance">{getCategory('finance')}</option>
   ```

5. **Valider avec des messages traduits**
   ```tsx
   if (!data.email) alert(message('email_invalide'));
   ```

### ❌ À ÉVITER

1. **Textes en dur dans les formulaires**
   ```tsx
   // ❌ Mauvais
   <label>Nom</label>

   // ✅ Bon
   <label>{label('nom')}</label>
   ```

2. **Alert sans traduction**
   ```tsx
   // ❌ Mauvais
   alert('Erreur !');

   // ✅ Bon
   alert(message('erreur'));
   ```

3. **Oublier d'ajouter submission_lang**
   ```tsx
   // ❌ Mauvais
   const data = { nom, email };

   // ✅ Bon
   const data = { nom, email, langue: submission_lang, submission_lang };
   ```

4. **Utiliser des labels traduits comme valeurs**
   ```tsx
   // ❌ Mauvais
   <option value="Finance & services bancaires">...</option>

   // ✅ Bon
   <option value="finance">{getCategory('finance')}</option>
   ```

---

## 11. Checklist pour un nouveau formulaire

- [ ] Importer `useFormTranslation()` et/ou `useFormSubmit()`
- [ ] Remplacer tous les labels par `label('cle')`
- [ ] Remplacer tous les placeholders par `placeholder('cle')`
- [ ] Remplacer tous les boutons par `button('cle')`
- [ ] Remplacer tous les messages par `message('cle')`
- [ ] Utiliser `getAllCategories()` pour les selects de catégories
- [ ] Ajouter `langue: submission_lang` dans les données Supabase
- [ ] Ajouter `submission_lang: submission_lang` dans les données Supabase
- [ ] Valider que la table Supabase a la colonne `submission_lang`
- [ ] Tester le formulaire dans les 5 langues
- [ ] Vérifier que les données sont bien envoyées vers Supabase

---

## 12. Support et maintenance

### 12.1 Fichiers clés

- `src/hooks/useFormTranslation.ts` - Traductions des formulaires
- `src/hooks/useFormSubmit.ts` - Hook générique de soumission
- `src/hooks/useCategoryTranslation.ts` - Traductions des catégories
- `src/context/LanguageContext.tsx` - Gestion de la langue active
- `src/lib/i18n.ts` - Configuration i18n globale

### 12.2 Debugging

```tsx
import { useFormTranslation } from '../hooks/useFormTranslation';

const DebugBadge = () => {
  const { submission_lang } = useFormTranslation();

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white px-3 py-1 rounded text-xs">
      Langue: {submission_lang}
    </div>
  );
};
```

### 12.3 Tests

Tester chaque formulaire dans les 5 langues :
1. Changer la langue via le sélecteur
2. Vérifier que tous les textes sont traduits
3. Soumettre le formulaire
4. Vérifier dans Supabase que `submission_lang` est correct

---

**Date de création** : 14 février 2026
**Version** : 2.0.0
**Statut** : ✅ Production Ready

---

## Contact

Pour toute question :
- Consulter les hooks dans `src/hooks/`
- Examiner les formulaires existants comme exemples
- Vérifier les tables Supabase pour la structure de données
