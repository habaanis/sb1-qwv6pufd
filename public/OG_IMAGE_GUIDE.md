# Guide pour l'Image OG (Open Graph)

## Format requis pour le partage sur les réseaux sociaux

Pour que la page `/notre-concept` s'affiche parfaitement sur WhatsApp, Facebook, Twitter et autres réseaux sociaux, vous devez créer une image OG optimisée.

### Spécifications techniques

- **Dimensions** : 1200 x 630 pixels (ratio 1.91:1)
- **Format** : JPG ou PNG
- **Poids** : Maximum 5 MB (idéalement < 1 MB)
- **Nom du fichier** : `og-concept-premium.jpg`
- **Emplacement** : `/public/og-concept-premium.jpg`

### Contenu suggéré pour l'image

#### Design recommandé :

1. **Fond** : Dégradé doré (couleurs #D4AF37 à #FFD700) ou image de la chechia tunisienne
2. **Bordure** : Bordure dorée élégante de 10-15px
3. **Texte principal** (centré) :
   - "Dalil Tounes" en grande typographie dorée
   - "L'Excellence au Service de la Tunisie"
4. **Logo** : Chechia tunisienne en haut ou en arrière-plan subtil
5. **Éléments visuels** :
   - Motifs géométriques tunisiens subtils
   - Icône de couronne ou étoiles pour l'aspect premium

#### Palette de couleurs :

- **Or principal** : #D4AF37
- **Or clair** : #FFD700
- **Noir/Gris foncé** : #1a1a1a (pour contraste)
- **Blanc** : #FFFFFF (pour texte sur fond foncé)

### Outils pour créer l'image

#### Option 1 : Canva (Recommandé - Gratuit)
1. Allez sur [canva.com](https://www.canva.com)
2. Créez un design avec les dimensions 1200 x 630 px
3. Utilisez le template "Facebook Post" ou "Twitter Post"
4. Téléchargez en JPG haute qualité

#### Option 2 : Figma (Pour designers)
1. Créez un frame 1200 x 630 px
2. Utilisez les couleurs et polices spécifiées
3. Exportez en JPG ou PNG

#### Option 3 : Photoshop / GIMP
1. Nouveau document : 1200 x 630 pixels, 72 DPI
2. Appliquez le design
3. Enregistrez pour le web (JPG, qualité 85-90%)

### Installation de l'image

Une fois l'image créée :

1. Nommez-la `og-concept-premium.jpg`
2. Placez-la dans le dossier `/public/` du projet
3. L'image sera automatiquement utilisée lors du partage de la page `/notre-concept`

### Test de l'image OG

Après avoir ajouté l'image, testez-la sur :

- **Facebook Debugger** : [developers.facebook.com/tools/debug](https://developers.facebook.com/tools/debug/)
- **Twitter Card Validator** : [cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator)
- **LinkedIn Post Inspector** : [linkedin.com/post-inspector](https://www.linkedin.com/post-inspector/)

### Exemple de texte pour l'image

```
DALIL TOUNES
━━━━━━━━━━━━━━━

L'Excellence au Service
de la Tunisie

L'Humain · Le Digital · Le Patrimoine
```

### Notes importantes

- L'image doit être lisible même en petit format (prévisualisation WhatsApp)
- Évitez trop de texte (WhatsApp peut le rogner)
- Assurez-vous d'un bon contraste pour la lisibilité
- Testez sur mobile et desktop

---

**Contact** : Pour toute question technique, contactez l'équipe de développement.
