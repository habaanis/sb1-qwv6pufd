# 📋 Migration BoltDatabase → supabaseClient

## 🎯 Objectif
Remplacer tous les imports de `BoltDatabase` par `supabaseClient` pour uniformiser la configuration Supabase dans toute l'application.

---

## ✅ Fichiers Déjà Migrés

1. ✅ `src/components/PremiumPartnersSection.tsx` (3 avril 2026)
2. ✅ `src/components/BusinessDetail.tsx` (3 avril 2026)
3. ✅ `src/components/UnifiedSearchBar.tsx` (déjà OK)
4. ✅ `src/pages/Businesses.tsx` (déjà OK)

---

## 🔄 Fichiers à Migrer (32 restants)

### Composants (18)
- [ ] `src/components/AdminDashboard.tsx`
- [ ] `src/components/AlerteRechercheForm.tsx`
- [ ] `src/components/AnnouncementCard.tsx`
- [ ] `src/components/AnnouncementDetail.tsx`
- [ ] `src/components/AnnouncementForm.tsx`
- [ ] `src/components/AvisForm.tsx`
- [ ] `src/components/AvisSection.tsx`
- [ ] `src/components/business/BusinessDirectory.tsx`
- [ ] `src/components/CityAutocomplete.tsx`
- [ ] `src/components/CompanyCountCard.tsx`
- [ ] `src/components/EntrepriseAvisForm.tsx`
- [ ] `src/components/FeaturedEventsCarousel.tsx`
- [ ] `src/components/HomeFeedbackWidget.tsx`
- [ ] `src/components/LeisureEventProposalForm.tsx`
- [ ] `src/components/LocalBusinessesSection.tsx`
- [ ] `src/components/NegotiationModal.tsx`
- [ ] `src/components/ReportModal.tsx`
- [ ] `src/components/TeacherSignupModal.tsx`

### Librairies (2)
- [ ] `src/lib/bannerAds.ts`
- [ ] `src/lib/imageUtils.ts`
- [x] `src/lib/supabaseClient.ts` (imports BoltDatabase pour garder rétrocompat)

### Pages (11)
- [ ] `src/pages/AdminInscriptionsLoisirs.tsx`
- [ ] `src/pages/AdminSourcing.tsx`
- [ ] `src/pages/AroundMe.tsx`
- [ ] `src/pages/BusinessEvents.tsx`
- [ ] `src/pages/Citizens.tsx`
- [ ] `src/pages/CitizensHealth.tsx`
- [ ] `src/pages/CitizensLeisure.tsx`
- [ ] `src/pages/CultureEvents.tsx`
- [ ] `src/pages/EducationEventForm.tsx`
- [ ] `src/pages/LocalMarketplace.tsx`
- [ ] `src/pages/TransportInscription.tsx`

---

## 🔧 Script de Migration Automatique

```bash
#!/bin/bash
# scripts/migrate_supabase_imports.sh

echo "🔄 Migration BoltDatabase → supabaseClient..."

# Liste des fichiers à migrer
files=(
  "src/components/AdminDashboard.tsx"
  "src/components/AlerteRechercheForm.tsx"
  "src/components/AnnouncementCard.tsx"
  "src/components/AnnouncementDetail.tsx"
  "src/components/AnnouncementForm.tsx"
  "src/components/AvisForm.tsx"
  "src/components/AvisSection.tsx"
  "src/components/business/BusinessDirectory.tsx"
  "src/components/CityAutocomplete.tsx"
  "src/components/CompanyCountCard.tsx"
  "src/components/EntrepriseAvisForm.tsx"
  "src/components/FeaturedEventsCarousel.tsx"
  "src/components/HomeFeedbackWidget.tsx"
  "src/components/LeisureEventProposalForm.tsx"
  "src/components/LocalBusinessesSection.tsx"
  "src/components/NegotiationModal.tsx"
  "src/components/ReportModal.tsx"
  "src/components/TeacherSignupModal.tsx"
  "src/lib/bannerAds.ts"
  "src/lib/imageUtils.ts"
  "src/pages/AdminInscriptionsLoisirs.tsx"
  "src/pages/AdminSourcing.tsx"
  "src/pages/AroundMe.tsx"
  "src/pages/BusinessEvents.tsx"
  "src/pages/Citizens.tsx"
  "src/pages/CitizensHealth.tsx"
  "src/pages/CitizensLeisure.tsx"
  "src/pages/CultureEvents.tsx"
  "src/pages/EducationEventForm.tsx"
  "src/pages/LocalMarketplace.tsx"
  "src/pages/TransportInscription.tsx"
)

count=0
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Migration de $file..."
    sed -i "s|from '../lib/BoltDatabase'|from '../lib/supabaseClient'|g" "$file"
    sed -i "s|from '../../lib/BoltDatabase'|from '../../lib/supabaseClient'|g" "$file"
    ((count++))
  else
    echo "⚠️  Fichier non trouvé: $file"
  fi
done

echo ""
echo "✅ Migration terminée : $count fichiers modifiés"
echo ""
echo "🧪 Lancer les tests:"
echo "   npm run build"
echo "   npm run typecheck"
```

**Utilisation** :
```bash
chmod +x scripts/migrate_supabase_imports.sh
./scripts/migrate_supabase_imports.sh
```

---

## 🔍 Vérification Après Migration

### 1. Recherche d'imports restants
```bash
grep -r "from.*BoltDatabase" src/
```

**Résultat attendu** : Aucun fichier (sauf BoltDatabase.js lui-même)

---

### 2. Build TypeScript
```bash
npm run typecheck
```

**Résultat attendu** : 0 erreurs

---

### 3. Build Production
```bash
npm run build
```

**Résultat attendu** : Build réussi

---

## 🗑️ Suppression de BoltDatabase.js

**Une fois tous les fichiers migrés** :

```bash
# 1. Vérifier qu'aucun fichier ne l'importe
grep -r "BoltDatabase" src/ | grep -v "supabaseClient.ts"

# 2. Si vide, supprimer le fichier
rm src/lib/BoltDatabase.js

# 3. Build pour vérifier
npm run build
```

---

## 📊 Statistiques

- **Total de fichiers** : 32
- **Déjà migrés** : 4 (12%)
- **À migrer** : 28 (88%)
- **Temps estimé** : 10 minutes (avec script automatique)

---

## ✅ Checklist de Migration

- [x] Identifier tous les fichiers utilisant BoltDatabase
- [x] Créer script de migration automatique
- [ ] Exécuter le script
- [ ] Vérifier avec grep
- [ ] Lancer npm run typecheck
- [ ] Lancer npm run build
- [ ] Tester en local
- [ ] Supprimer BoltDatabase.js
- [ ] Commit et push

---

**Date** : 3 avril 2026
**Status** : 📋 **EN ATTENTE**
