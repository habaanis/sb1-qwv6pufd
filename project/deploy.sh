#!/bin/bash

# Script de déploiement automatisé pour Netlify
# Usage: ./deploy.sh [test|prod]

set -e

echo "🚀 Déploiement Dalil Tounes sur Netlify"
echo "========================================"

# Vérifier si Netlify CLI est installé
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI n'est pas installé"
    echo "Installation en cours..."
    npm install -g netlify-cli
fi

# Build du projet
echo "📦 Build du projet..."
npm run build

# Vérifier que le build a réussi
if [ ! -d "dist" ]; then
    echo "❌ Erreur: Le dossier dist n'existe pas"
    exit 1
fi

# Déploiement
if [ "$1" == "test" ]; then
    echo "🧪 Déploiement de test (preview)..."
    netlify deploy
    echo ""
    echo "✅ Déploiement de test réussi !"
    echo "📎 Vérifiez l'URL de preview ci-dessus"
elif [ "$1" == "prod" ]; then
    echo "🌐 Déploiement en PRODUCTION..."
    netlify deploy --prod
    echo ""
    echo "✅ Déploiement en production réussi !"
    echo "🎉 Votre site est maintenant en ligne !"
else
    echo "Usage: ./deploy.sh [test|prod]"
    echo ""
    echo "Options:"
    echo "  test - Déploiement de test (preview URL)"
    echo "  prod - Déploiement en production"
    exit 1
fi

echo ""
echo "📊 Statistiques du build:"
du -sh dist/
echo ""
echo "🔗 Pour ouvrir le site: netlify open"
