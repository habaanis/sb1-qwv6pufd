# Guide de Déploiement - Netlify Drop

## Problème Résolu : Page Concept Blanche

### Cause du Problème
L'ancien fichier ZIP contenait une version obsolète du fichier `Concept-DwQD_L0I.js`. Le nouveau build a généré `Concept-FU9iIh1c.js` avec tous les correctifs nécessaires.

### Solution

#### 1. Fichier ZIP de Production Prêt à Déployer
Le fichier suivant est maintenant disponible et prêt à être déployé :
```
dalil-tounes-netlify-production-20260403.zip (6.9 MB)
```

#### 2. Étapes de Déploiement sur Netlify Drop

**Option A : Drag & Drop (Recommandé)**
1. Allez sur [app.netlify.com/drop](https://app.netlify.com/drop)
2. Glissez-déposez le fichier `dalil-tounes-netlify-production-20260403.zip`
3. Attendez la fin du déploiement
4. Testez la page `/concept` et `/notre-concept`

**Option B : Netlify CLI**
```bash
# Installer Netlify CLI si nécessaire
npm install -g netlify-cli

# Se connecter
netlify login

# Déployer
netlify deploy --prod --dir=dist
```

#### 3. Vérification Post-Déploiement

Testez toutes ces URLs pour vérifier que la page Concept fonctionne :
- `https://votre-site.netlify.app/concept`
- `https://votre-site.netlify.app/notre-concept`
- `https://votre-site.netlify.app/concept?lang=fr`
- `https://votre-site.netlify.app/concept?lang=en`
- `https://votre-site.netlify.app/concept?lang=ar`

### Contenu du Fichier ZIP

Le fichier ZIP contient :
- ✅ `index.html` - Point d'entrée de l'application
- ✅ `_redirects` - Configuration du routing SPA pour Netlify
- ✅ `assets/Concept-FU9iIh1c.js` - Page Concept à jour
- ✅ Tous les autres assets JavaScript et CSS
- ✅ Images et icônes PWA
- ✅ `sitemap.xml`, `robots.txt`, `manifest.json`

### Configuration `_redirects` (déjà incluse)

Le fichier `_redirects` contient :
```
# Anciennes routes hash vers nouvelles routes propres
/#/concept /concept 301!
/#/notre-concept /concept 301!

# SPA fallback - toutes les autres routes vers index.html
/*    /index.html   200
```

Cette configuration garantit que :
1. Les anciennes URLs avec hash (#) redirigent vers les nouvelles URLs propres
2. Toutes les routes client-side (React Router) fonctionnent correctement
3. La page Concept est accessible via `/concept` et `/notre-concept`

### Génération Future du ZIP

Pour générer un nouveau ZIP de production après des modifications :

```bash
# 1. Générer le sitemap
npm run sitemap

# 2. Build de production
npm run build

# 3. Créer le ZIP
cd dist && zip -r ../dalil-tounes-netlify-production-$(date +%Y%m%d).zip . && cd ..
```

### Diagnostic en Cas de Problème

Si la page Concept reste blanche après déploiement :

1. **Vérifier la console du navigateur** (F12)
   - Cherchez les erreurs JavaScript
   - Vérifiez que tous les fichiers se chargent (onglet Network)

2. **Vérifier que le fichier `_redirects` est présent**
   ```
   https://votre-site.netlify.app/_redirects
   ```
   (devrait retourner le contenu du fichier)

3. **Vérifier le routing**
   - Testez d'abord `/` (accueil) - doit fonctionner
   - Puis testez `/businesses` - doit fonctionner
   - Enfin testez `/concept` - doit fonctionner

4. **Vérifier les variables d'environnement Netlify**
   - Assurez-vous que `VITE_SUPABASE_URL` est défini
   - Assurez-vous que `VITE_SUPABASE_ANON_KEY` est défini

### Support

Si le problème persiste :
1. Vérifiez les logs de déploiement Netlify
2. Testez le build en local avec `npm run preview`
3. Comparez le hash du fichier Concept dans le ZIP et sur Netlify

---

**Dernière mise à jour** : 3 avril 2026
**Version du ZIP** : dalil-tounes-netlify-production-20260403.zip
**Fichier Concept** : Concept-FU9iIh1c.js (14.59 KB)
