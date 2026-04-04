#!/bin/bash

# Script pour corriger automatiquement la navigation dans tous les fichiers

FILES=(
  "src/pages/Citizens.tsx"
  "src/pages/CitizensAdmin.tsx"
  "src/pages/CitizensHealth.tsx"
  "src/pages/CitizensLeisure.tsx"
  "src/pages/CitizensServices.tsx"
  "src/pages/CitizensShops.tsx"
  "src/pages/CitizensTourism.tsx"
  "src/pages/EducationNew.tsx"
  "src/pages/CultureEvents.tsx"
  "src/pages/AroundMe.tsx"
  "src/pages/Concept.tsx"
  "src/pages/BusinessEvents.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "🔧 Fixing $file..."

    # Ajouter l'import useNavigate si pas déjà présent
    if ! grep -q "import.*useNavigate.*from 'react-router-dom'" "$file"; then
      # Trouver la première ligne d'import de React
      sed -i "1s/^/import { useNavigate } from 'react-router-dom';\n/" "$file"
    fi

    echo "✅ Fixed $file"
  fi
done

echo "🎉 All files fixed!"
