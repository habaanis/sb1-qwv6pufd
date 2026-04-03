# Déploiement Rapide - 3 Minutes

## Option A : CLI (Ligne de commande) ⚡

```bash
# 1. Connexion à Netlify
netlify login

# 2. Déploiement en production
./deploy.sh prod
```

C'est tout ! Votre site sera en ligne.

---

## Option B : Drag & Drop (Interface Web) 🖱️

1. Ouvrez https://app.netlify.com/drop
2. Glissez-déposez le dossier `dist/`
3. Attendez 30 secondes
4. Votre site est en ligne !

---

## Option C : GitHub (Déploiement Continu) 🔄

```bash
# 1. Créer un repo GitHub
git init
git add .
git commit -m "Dalil Tounes - Initial"
git branch -M main
git remote add origin https://github.com/VOTRE-USERNAME/dalil-tounes.git
git push -u origin main
```

2. Sur Netlify :
   - New site from Git
   - Choisir GitHub
   - Sélectionner le repo
   - Build command : `npm run build`
   - Publish directory : `dist`
   - Deploy site

---

## Configuration des Variables (Optionnel)

Sur Netlify Dashboard > Site settings > Environment variables :

```
VITE_SUPABASE_URL=https://kmvjegbtroksjqaqliyv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Note : Les variables sont déjà dans le code, mais c'est une bonne pratique de les configurer sur Netlify.

---

## Votre Site Sera Accessible à :

```
https://VOTRE-NOM-SITE.netlify.app
```

## Pour un Domaine Personnalisé :

1. Site settings > Domain management
2. Add custom domain
3. Entrez : `dalil-tounes.tn` (ou votre domaine)
4. Configurez vos DNS selon les instructions

---

## Besoin d'Aide ?

Consultez `DEPLOIEMENT_NETLIFY.md` pour le guide complet.
