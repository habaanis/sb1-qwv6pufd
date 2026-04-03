# Guide d'internationalisation des formulaires

## Vue d'ensemble

Ce guide explique comment rendre vos formulaires multilingues en utilisant le système i18n existant du projet.

## Hook useFormTranslation

Le hook `useFormTranslation` fournit des traductions pour tous les éléments de formulaire dans 5 langues :
- Français (fr)
- Anglais (en)
- Italien (it)
- Russe (ru)
- Arabe (ar)

### Utilisation

```tsx
import { useFormTranslation } from '../hooks/useFormTranslation';

const MonFormulaire = () => {
  const { label, placeholder, button, message, language } = useFormTranslation();

  // Utilisez les fonctions de traduction
  return (
    <div>
      <label>{label('nom')}</label>
      <input placeholder={placeholder('nom')} />
      <button>{button('soumettre')}</button>
    </div>
  );
};
```

## Clés de traduction disponibles

### Labels
- `nom`, `prenom`, `nom_et_prenom`
- `nom_evenement`, `titre_evenement`
- `organisateur`, `ville`, `gouvernorat`
- `date_debut`, `date_fin`, `date_evenement`
- `heure`, `prix`, `prix_entree`
- `description`, `whatsapp`, `telephone`, `email`
- `type_affichage`, `categorie`
- `lien_billetterie`, `adresse`, `site_web`

### Placeholders
Mêmes clés que les labels avec des textes adaptés

### Boutons
- `soumettre`, `envoyer`, `inscrire`
- `confirmer`, `annuler`, `retour`, `suivant`

### Messages
- `succes`, `erreur`
- `champ_requis`, `email_invalide`, `telephone_invalide`

## Champ caché langue_soumission

Ajoutez automatiquement la langue de soumission à vos données :

```tsx
const { language } = useFormTranslation();

const dataToSubmit = {
  ...formData,
  langue_soumission: language, // Ajoute 'fr', 'en', 'it', 'ru', ou 'ar'
};
```

## Migration de la base de données

Pour ajouter la colonne `langue_soumission` à vos tables, utilisez cette migration :

```sql
ALTER TABLE ma_table ADD COLUMN IF NOT EXISTS langue_soumission TEXT DEFAULT 'fr';
```

## Exemple complet

Voici un exemple d'implémentation dans un formulaire :

```tsx
import React, { useState } from 'react';
import { useFormTranslation } from '../hooks/useFormTranslation';
import { supabase } from '../lib/BoltDatabase';

const MonFormulaire = () => {
  const { label, placeholder, button, message, language } = useFormTranslation();
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('ma_table')
        .insert([{
          ...formData,
          langue_soumission: language, // Champ caché automatique
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
        <label>{label('description')} *</label>
        <textarea
          required
          placeholder={placeholder('description')}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <button type="submit">{button('soumettre')}</button>
      <button type="button">{button('annuler')}</button>
    </form>
  );
};
```

## Formulaires déjà mis à jour

- ✅ LeisureEventProposalForm.tsx

## Formulaires à mettre à jour

- RegistrationForm.tsx
- QuoteForm.tsx
- AnnouncementForm.tsx
- EntrepriseAvisForm.tsx
- AlerteRechercheForm.tsx
- MedicalTransportRegistrationForm.tsx
- EducationEventForm.tsx
- AvisForm.tsx
- CandidateForm.tsx
- JobPostForm.tsx

## Ajout de nouvelles clés

Pour ajouter de nouvelles clés de traduction, modifiez le fichier `src/hooks/useFormTranslation.ts` :

```tsx
export const formTranslations: Record<Language, {...}> = {
  fr: {
    labels: {
      // Ajoutez vos nouvelles clés ici
      ma_nouvelle_cle: 'Mon nouveau label',
    },
    // ...
  },
  en: {
    labels: {
      ma_nouvelle_cle: 'My new label',
    },
    // ...
  },
  // Répétez pour it, ru, ar
};
```

## Détection automatique de la langue

La langue est automatiquement détectée depuis le contexte `LanguageContext` du projet. Lorsque l'utilisateur change la langue de l'interface, tous les formulaires s'adaptent instantanément.

## Notes importantes

1. Le champ `langue_soumission` est ajouté automatiquement lors de la soumission
2. Les traductions sont centralisées dans un seul fichier
3. Aucune modification des fichiers i18n.ts n'est nécessaire
4. Le système est compatible avec toutes les langues du projet
5. Les formulaires s'adaptent automatiquement au changement de langue

## Support

Pour toute question ou ajout de nouvelles clés de traduction, consultez :
- `src/hooks/useFormTranslation.ts` - Hook de traduction
- `src/context/LanguageContext.tsx` - Contexte de langue
- `src/lib/i18n.ts` - Système i18n principal
