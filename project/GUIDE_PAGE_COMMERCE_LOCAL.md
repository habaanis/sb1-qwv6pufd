# Guide - Colonne page_commerce_local

## Description
Nouvelle colonne ajoutée à la table `entreprise` pour contrôler l'affichage des établissements sur la page "Commerces & Magasins".

## Changements apportés

### 1. Migration Supabase
- **Fichier**: `supabase/migrations/add_page_commerce_local_to_entreprise.sql`
- **Colonne ajoutée**: `page_commerce_local` (boolean, défaut: false)
- **Index créés** pour optimiser les performances:
  - `idx_entreprise_page_commerce_local`: Index sur la colonne seule
  - `idx_entreprise_commerce_secteur`: Index composite pour les recherches filtrées

### 2. Code Frontend
- **Fichier modifié**: `src/pages/CitizensShops.tsx`
- **Changement**: Requête modifiée pour filtrer par `page_commerce_local = true` au lieu de `is_local_verified = true`

## Interface d'administration

### Recommandations pour l'interface de gestion

Quand une interface d'administration sera créée pour gérer les entreprises, ce champ devra être ajouté avec les spécifications suivantes :

#### 1. Label du champ
```
✅ "Afficher sur la page Commerce Local"
```

#### 2. Type d'input
- Checkbox (boolean)
- État par défaut: Non coché (false)

#### 3. Emplacement suggéré
- Section "Visibilité et Pages" ou "Paramètres d'affichage"
- Groupé avec d'autres options similaires comme `is_premium`, `is_local_verified`, etc.

#### 4. Exemple de code pour l'interface admin

```tsx
<div className="space-y-4">
  <h3 className="text-lg font-semibold">Paramètres d'affichage</h3>

  <label className="flex items-center gap-3 cursor-pointer">
    <input
      type="checkbox"
      name="page_commerce_local"
      checked={formData.page_commerce_local}
      onChange={handleCheckboxChange}
      className="w-5 h-5 text-[#4A1D43] border-gray-300 rounded focus:ring-[#D4AF37]"
    />
    <div>
      <span className="font-medium text-gray-900">
        Afficher sur la page Commerce Local
      </span>
      <p className="text-sm text-gray-500">
        Cocher pour rendre cet établissement visible sur la page Commerces & Magasins
      </p>
    </div>
  </label>

  {/* Autres checkboxes similaires */}
  <label className="flex items-center gap-3 cursor-pointer">
    <input
      type="checkbox"
      name="is_premium"
      checked={formData.is_premium}
      onChange={handleCheckboxChange}
      className="w-5 h-5 text-[#4A1D43] border-gray-300 rounded focus:ring-[#D4AF37]"
    />
    <span className="font-medium text-gray-900">Compte Premium</span>
  </label>
</div>
```

## Logique de validation

### Critères d'affichage sur la page Commerces & Magasins

Un établissement sera affiché SI ET SEULEMENT SI :
1. `secteur = 'magasin'`
2. `page_commerce_local = true`

### Ordre de tri
Les établissements sont triés dans l'ordre suivant :
1. **Établissements Premium** (`is_premium = true`) en premier
2. **Ordre alphabétique** par nom

## Notes importantes

- La colonne `is_local_verified` reste en place et peut être utilisée pour d'autres fonctionnalités
- Par défaut, les nouveaux établissements NE SONT PAS affichés (page_commerce_local = false)
- Les administrateurs doivent manuellement cocher cette option pour valider l'affichage
- Les index créés garantissent de bonnes performances même avec un grand nombre d'établissements

## Prochaines étapes

1. Créer une interface d'administration pour la gestion des entreprises
2. Implémenter le formulaire d'édition avec le champ `page_commerce_local`
3. Ajouter des permissions appropriées pour contrôler qui peut modifier ce champ
4. Envisager un workflow de validation pour automatiser l'approbation
