# Guide de Déploiement Rapide - Dalil Tounes

## 🚀 Déploiement en 5 Minutes

### Étape 1 : Migration Supabase (OBLIGATOIRE - 2 minutes)

1. Ouvrir [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet : `kmvjegbtroksjqaqliyv`
3. Aller dans **SQL Editor** (barre latérale gauche)
4. Cliquer sur **New Query**
5. Copier-coller TOUT le contenu du fichier :
   ```
   supabase/migrations/fix_search_smart_autocomplete_text_id.sql
   ```
6. Cliquer sur **Run** (ou Ctrl+Enter)
7. Vérifier qu'il n'y a **pas d'erreur** (message "Success" en vert)

**Test rapide** :
```sql
SELECT * FROM search_smart_autocomplete('test') LIMIT 5;
```
Si vous voyez des résultats → ✅ Migration réussie

---

### Étape 2 : Build Local (1 minute)

```bash
# Depuis la racine du projet
npm run build
```

**Résultat attendu** :
```
✓ 2105 modules transformed.
✓ built in 12.74s
```

Si erreur → Lire le message d'erreur et corriger

---

### Étape 3 : Déploiement Netlify (2 minutes)

#### Option A : Drag & Drop (Recommandé)
1. Ouvrir https://app.netlify.com/drop
2. Glisser-déposer le dossier `dist/` depuis votre explorateur de fichiers
3. Attendre 30-60 secondes
4. Copier l'URL de déploiement

#### Option B : Netlify CLI
```bash
# Installer Netlify CLI (si pas déjà fait)
npm install -g netlify-cli

# Se connecter
netlify login

# Déployer
netlify deploy --prod --dir=dist

# Suivre les instructions
```

---

### Étape 4 : Vérification Post-Déploiement (30 secondes)

1. Ouvrir https://dalil-tounes.com/
2. Taper "sante" dans la recherche
3. Cliquer sur un résultat
4. Vérifier que la fiche s'affiche

✅ Si tout fonctionne → Déploiement réussi !

---

## 🐛 Dépannage Rapide

### Problème : "Aucun résultat de recherche"

**Cause** : Migration Supabase pas appliquée

**Solution** :
```sql
-- Dans Supabase SQL Editor
SELECT proname FROM pg_proc WHERE proname = 'search_smart_autocomplete';
-- Si 0 résultat → Refaire Étape 1
```

---

### Problème : "Page blanche au clic"

**Cause** : Variables d'environnement ou erreur JavaScript

**Solution** :
1. Ouvrir la console du navigateur (F12)
2. Regarder les erreurs en rouge
3. Si "VITE_SUPABASE_URL is not defined" :
   ```bash
   # Vérifier .env
   cat .env
   # Doit contenir :
   # VITE_SUPABASE_URL=https://kmvjegbtroksjqaqliyv.supabase.co
   # VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```

---

### Problème : "Build échoue"

**Cause** : Erreur TypeScript ou dépendances manquantes

**Solution** :
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install

# Relancer le build
npm run build
```

---

## 📦 Commandes Git (Optionnel)

```bash
# Ajouter tous les changements
git add .

# Commit avec message descriptif
git commit -m "fix: correction bugs critiques recherche et navigation"

# Push vers GitHub
git push origin main
```

---

## 🎯 Checklist Express

- [ ] Migration Supabase appliquée
- [ ] Test SQL réussi
- [ ] `npm run build` OK
- [ ] Dossier `dist/` généré
- [ ] Déploiement Netlify fait
- [ ] Test recherche sur le site
- [ ] Test navigation sur le site

**Temps total estimé : 5 minutes**

---

## 📞 Contacts et Ressources

- **Dashboard Supabase** : https://supabase.com/dashboard/project/kmvjegbtroksjqaqliyv
- **Dashboard Netlify** : https://app.netlify.com/
- **Site Production** : https://dalil-tounes.com/

---

**Dernière mise à jour** : 3 avril 2026
