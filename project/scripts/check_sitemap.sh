#!/bin/bash

###############################################################################
# Script de vérification du sitemap
# Vérifie que le sitemap est valide et accessible
###############################################################################

echo "🔍 Vérification du sitemap Dalil Tounes"
echo ""

# Vérifier l'existence du fichier
if [ ! -f "public/sitemap.xml" ]; then
  echo "❌ Fichier sitemap.xml introuvable dans public/"
  echo "   Exécutez: npm run sitemap"
  exit 1
fi

echo "✅ Fichier sitemap.xml trouvé"
echo ""

# Compter les URLs
URL_COUNT=$(grep -c "<loc>" public/sitemap.xml)
echo "📊 Nombre d'URLs: $URL_COUNT"
echo ""

# Vérifier la syntaxe XML
if command -v xmllint &> /dev/null; then
  echo "🔍 Vérification de la syntaxe XML..."
  if xmllint --noout public/sitemap.xml 2>/dev/null; then
    echo "✅ Syntaxe XML valide"
  else
    echo "⚠️  Erreur de syntaxe XML détectée"
  fi
  echo ""
fi

# Afficher les statistiques
echo "📈 Statistiques:"
echo "  - Pages statiques: $(grep -c "https://dalil-tounes.com/[^/]*</loc>" public/sitemap.xml || echo "0")"
echo "  - Entreprises: $(grep -c "/p/" public/sitemap.xml || echo "0")"
echo "  - Événements: $(grep -c "/event/" public/sitemap.xml || echo "0")"
echo "  - Emplois: $(grep -c "/job/" public/sitemap.xml || echo "0")"
echo "  - Loisirs: $(grep -c "/loisir/" public/sitemap.xml || echo "0")"
echo ""

# Vérifier robots.txt
if [ -f "public/robots.txt" ]; then
  echo "✅ robots.txt trouvé"
  if grep -q "sitemap.xml" public/robots.txt; then
    echo "✅ robots.txt pointe vers le sitemap"
  else
    echo "⚠️  robots.txt ne pointe pas vers le sitemap"
  fi
else
  echo "⚠️  robots.txt introuvable"
fi
echo ""

# Taille du fichier
SITEMAP_SIZE=$(du -h public/sitemap.xml | cut -f1)
echo "📦 Taille du sitemap: $SITEMAP_SIZE"
echo ""

# Dernière modification
LAST_MOD=$(stat -c %y public/sitemap.xml 2>/dev/null || stat -f "%Sm" public/sitemap.xml 2>/dev/null)
echo "🕐 Dernière modification: $LAST_MOD"
echo ""

echo "✅ Vérification terminée!"
echo ""
echo "💡 Prochaines étapes:"
echo "   1. Soumettre à Google: ./scripts/submit_sitemap_to_google.sh"
echo "   2. Vérifier dans Google Search Console"
echo "   3. URL: https://dalil-tounes.com/sitemap.xml"
