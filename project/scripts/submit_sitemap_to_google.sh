#!/bin/bash

###############################################################################
# Script de soumission automatique du sitemap à Google
# Usage: ./scripts/submit_sitemap_to_google.sh
###############################################################################

SITEMAP_URL="https://dalil-tounes.com/sitemap.xml"
GOOGLE_PING_URL="https://www.google.com/ping?sitemap="
BING_PING_URL="https://www.bing.com/ping?sitemap="

echo "🚀 Soumission du sitemap aux moteurs de recherche..."
echo ""

# Ping Google
echo "📍 Soumission à Google..."
GOOGLE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${GOOGLE_PING_URL}${SITEMAP_URL}")
if [ "$GOOGLE_RESPONSE" = "200" ]; then
  echo "✅ Google : Sitemap soumis avec succès (HTTP $GOOGLE_RESPONSE)"
else
  echo "⚠️  Google : Réponse HTTP $GOOGLE_RESPONSE"
fi
echo ""

# Ping Bing
echo "📍 Soumission à Bing..."
BING_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${BING_PING_URL}${SITEMAP_URL}")
if [ "$BING_RESPONSE" = "200" ]; then
  echo "✅ Bing : Sitemap soumis avec succès (HTTP $BING_RESPONSE)"
else
  echo "⚠️  Bing : Réponse HTTP $BING_RESPONSE"
fi
echo ""

echo "🎉 Processus terminé !"
echo ""
echo "📝 Notes :"
echo "  - Google peut prendre 24-48h pour indexer les nouvelles URLs"
echo "  - Vérifiez le statut dans Google Search Console"
echo "  - URL du sitemap : $SITEMAP_URL"
echo ""
