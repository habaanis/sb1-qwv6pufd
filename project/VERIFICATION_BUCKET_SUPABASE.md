# Vérification du Bucket Supabase - Structure des URLs d'images

## Configuration actuelle

### Informations du projet
- **URL Supabase** : `https://kmvjegbtroksjqaqliyv.supabase.co`
- **Bucket utilisé** : `photos-dalil`
- **Status du bucket** : PUBLIC

---

## Modèle d'URL généré par le code

Le code actuel dans `imageUtils.ts` génère des URLs selon ce format :

```
https://kmvjegbtroksjqaqliyv.supabase.co/storage/v1/object/public/photos-dalil/[nom_fichier]
```

### Exemple concret :
```
Fichier : "entreprise123.jpg"
URL générée : https://kmvjegbtroksjqaqliyv.supabase.co/storage/v1/object/public/photos-dalil/entreprise123.jpg
```

---

## Structure attendue du bucket

### Si les images sont à la racine du bucket :
```
photos-dalil/
  ├── entreprise1.jpg
  ├── entreprise2.jpg
  └── logo-xyz.png
```
**URL** : `https://kmvjegbtroksjqaqliyv.supabase.co/storage/v1/object/public/photos-dalil/entreprise1.jpg`

### Si les images sont dans un sous-dossier (par exemple "images/") :
```
photos-dalil/
  └── images/
      ├── entreprise1.jpg
      ├── entreprise2.jpg
      └── logo-xyz.png
```
**URL correcte** : `https://kmvjegbtroksjqaqliyv.supabase.co/storage/v1/object/public/photos-dalil/images/entreprise1.jpg`
**URL actuelle (INCORRECTE)** : `https://kmvjegbtroksjqaqliyv.supabase.co/storage/v1/object/public/photos-dalil/entreprise1.jpg`

---

## Comment vérifier la structure réelle de votre bucket

### Méthode 1 : Via l'interface Supabase
1. Allez sur https://supabase.com/dashboard/project/kmvjegbtroksjqaqliyv
2. Cliquez sur "Storage" dans le menu de gauche
3. Sélectionnez le bucket "photos-dalil"
4. Regardez la structure :
   - Les fichiers sont-ils directement à la racine ?
   - Ou sont-ils dans un dossier comme "images/", "uploads/", "entreprises/", etc. ?

### Méthode 2 : Via une URL de test
Essayez d'accéder directement à une image via le navigateur :

**Test 1 - Racine du bucket** :
```
https://kmvjegbtroksjqaqliyv.supabase.co/storage/v1/object/public/photos-dalil/[NOM_DE_VOTRE_FICHIER]
```

**Test 2 - Avec sous-dossier "images"** :
```
https://kmvjegbtroksjqaqliyv.supabase.co/storage/v1/object/public/photos-dalil/images/[NOM_DE_VOTRE_FICHIER]
```

**Test 3 - Avec sous-dossier "uploads"** :
```
https://kmvjegbtroksjqaqliyv.supabase.co/storage/v1/object/public/photos-dalil/uploads/[NOM_DE_VOTRE_FICHIER]
```

---

## Console logs ajoutés

J'ai modifié `imageUtils.ts` pour afficher dans la console du navigateur :

```
====== getSupabaseImageUrl DEBUG ======
📥 Input filename: [nom du fichier en base]
📦 Storage bucket: photos-dalil
📄 Has extension? [true/false]
📝 Final filename: [nom final avec extension]
🔗 Generated publicUrl: [URL complète générée]
🏗️  URL structure breakdown:
   - Protocol: https:
   - Host: kmvjegbtroksjqaqliyv.supabase.co
   - Pathname: /storage/v1/object/public/photos-dalil/[chemin]
   - Full URL: [URL complète]
✅ Returning generated URL: [URL finale]
=======================================
```

---

## Solutions selon le diagnostic

### Solution 1 : Si images à la racine du bucket (pas de sous-dossier)
Le code actuel est **CORRECT**.
Vérifiez que :
- Les noms de fichiers en base de données correspondent exactement aux noms dans le bucket
- Le bucket est bien PUBLIC
- Les fichiers ont été uploadés correctement

### Solution 2 : Si images dans un sous-dossier
Modifiez `imageUtils.ts` ligne 3 :

**Exemple avec dossier "images/"** :
```typescript
const STORAGE_BUCKET = 'photos-dalil';
const STORAGE_FOLDER = 'images'; // Ajout du dossier

export function getSupabaseImageUrl(...) {
  // ...
  const pathWithFolder = STORAGE_FOLDER
    ? `${STORAGE_FOLDER}/${finalFilename}`
    : finalFilename;

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(pathWithFolder);
  // ...
}
```

---

## Checklist de vérification

- [ ] Bucket "photos-dalil" existe et est PUBLIC
- [ ] Les images sont uploadées dans le bucket
- [ ] Noter la structure exacte : racine ou sous-dossier ?
- [ ] Les noms de fichiers en base correspondent aux noms dans le bucket
- [ ] Pas de slash "/" au début du nom de fichier en base
- [ ] Vérifier les console logs dans le navigateur (F12)
- [ ] Tester l'URL générée directement dans le navigateur

---

## Informations complémentaires

### Format de l'URL Supabase Storage (standard)
```
https://[PROJECT_REF].supabase.co/storage/v1/object/public/[BUCKET_NAME]/[FILE_PATH]
```

### Notre configuration
```
https://kmvjegbtroksjqaqliyv.supabase.co/storage/v1/object/public/photos-dalil/[FILE_PATH]
```

### Vérification des slashes
Le code Supabase `.getPublicUrl()` gère automatiquement les slashes :
- ✅ CORRECT : `getPublicUrl('image.jpg')` → `/photos-dalil/image.jpg`
- ✅ CORRECT : `getPublicUrl('folder/image.jpg')` → `/photos-dalil/folder/image.jpg`
- ❌ ÉVITER : `getPublicUrl('/image.jpg')` → `/photos-dalil//image.jpg` (double slash)

Notre code utilise `.trim()` pour éviter les espaces, mais ne retire pas les slashes initiaux.
Si vos noms de fichiers en base commencent par "/", cela créera un double slash.

---

## Actions à faire maintenant

1. **Ouvrir la console du navigateur** (F12 → Console)
2. **Naviguer vers une page avec des images d'entreprises**
3. **Observer les logs** avec le format ci-dessus
4. **Copier une URL générée** et la tester dans un nouvel onglet
5. **Noter la structure du bucket** dans Supabase Dashboard
6. **Me communiquer** :
   - L'URL complète générée dans les logs
   - Si l'URL fonctionne quand testée directement
   - La structure réelle du bucket (avec ou sans sous-dossier)
   - Un exemple de nom de fichier stocké en base de données

Une fois ces informations obtenues, je pourrai corriger précisément le chemin si nécessaire.
