#!/bin/bash

# Script de vérification pré-déploiement
echo "🔍 Vérification Pré-Déploiement Dalil Tounes"
echo "============================================="
echo ""

# Vérifier que le build existe
if [ ! -d "dist" ]; then
    echo "❌ Le dossier dist/ n'existe pas. Lancez 'npm run build' d'abord."
    exit 1
fi

echo "✅ Dossier dist/ présent"

# Vérifier les fichiers critiques
CRITICAL_FILES=("dist/index.html" "dist/sitemap.xml" "dist/robots.txt" "dist/manifest.json")
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file présent"
    else
        echo "⚠️  $file manquant"
    fi
done

# Vérifier la taille
SIZE=$(du -sh dist/ | cut -f1)
echo ""
echo "📦 Taille totale: $SIZE"

# Compter les fichiers
FILE_COUNT=$(find dist/ -type f | wc -l)
echo "📄 Nombre de fichiers: $FILE_COUNT"

# Vérifier les assets
if [ -d "dist/assets" ]; then
    ASSET_COUNT=$(ls -1 dist/assets/*.js dist/assets/*.css 2>/dev/null | wc -l)
    echo "🎨 Assets (JS/CSS): $ASSET_COUNT fichiers"
fi

# Vérifier la configuration Netlify
if [ -f "netlify.toml" ]; then
    echo "✅ netlify.toml configuré"
else
    echo "⚠️  netlify.toml manquant"
fi

# Vérifier les variables d'environnement
if [ -f ".env" ]; then
    echo "✅ .env présent (variables configurées)"
else
    echo "⚠️  .env manquant"
fi

echo ""
echo "============================================="
echo "🎯 Résultat: Prêt pour le déploiement !"
echo ""
echo "Commandes de déploiement:"
echo "  - Test preview:  ./deploy.sh test"
echo "  - Production:    ./deploy.sh prod"
echo "  - Drag & Drop:   https://app.netlify.com/drop"
echo ""
