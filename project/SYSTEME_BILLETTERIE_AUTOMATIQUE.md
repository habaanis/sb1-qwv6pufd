# Système de Billetterie Automatique

## Vue d'ensemble

Le système analyse automatiquement les URLs de billetterie et adapte le bouton en fonction de la plateforme détectée.

## Configuration Supabase

### Table `culture_events`

La table contient bien la colonne `lien_billetterie` (type: text)

```sql
ALTER TABLE culture_events
ADD COLUMN IF NOT EXISTS lien_billetterie text;
```

### Requêtes

Toutes les requêtes utilisent `.select('*')` qui récupère **tous** les champs, y compris `lien_billetterie` :

**Dans `CultureEvents.tsx` :**
```typescript
const { data: allData, error: allError } = await supabase
  .from('culture_events')
  .select('*')  // ✅ Récupère lien_billetterie
  .order('date_debut', { ascending: true });
```

**Dans `CitizensLeisure.tsx` :**
```typescript
let query = supabase
  .from('culture_events')
  .select('*')  // ✅ Récupère lien_billetterie
  .gte('date_debut', new Date().toISOString());
```

## Logique d'Analyse Automatique

### Fichier centralisé : `/src/lib/ticketLinkAnalyzer.ts`

```typescript
export const analyzeTicketLink = (url?: string): TicketLinkAnalysis => {
  // 1. Sécurité : Masquer si lien vide ou invalide
  if (!url || url.trim() === '') {
    return { show: false };
  }

  // 2. Sécurité : Masquer si contient "example" ou "description"
  if (url.includes('example') || url.includes('description')) {
    return { show: false };
  }

  // 3. Facebook/Instagram → Bouton bleu
  if (url.includes('facebook.com') || url.includes('instagram.com')) {
    return {
      text: 'Voir l\'événement',
      colorClass: 'bg-gradient-to-r from-[#1877F2] to-[#0C63D4]',
      show: true
    };
  }

  // 4. Plateformes de billetterie → Bouton orange
  if (url.includes('tesketki') || url.includes('ibelit') || url.includes('eventbrite')) {
    return {
      text: 'Réserver mes places',
      colorClass: 'bg-gradient-to-r from-[#FF6B35] to-[#F7931E]',
      show: true
    };
  }

  // 5. Sites tunisiens (.tn) → Bouton sobre
  if (url.includes('.tn')) {
    return {
      text: 'Site Officiel',
      colorClass: 'bg-gradient-to-r from-[#475569] to-[#334155]',
      show: true
    };
  }

  // 6. Par défaut → Bouton rouge chéchia
  return {
    text: 'Réserver ma place',
    colorClass: 'bg-gradient-to-r from-[#C41E3A] to-[#8B0000]',
    show: true
  };
};
```

## Composants mis à jour

### EventCard.tsx
```typescript
import { analyzeTicketLink, getPrixValue } from '../lib/ticketLinkAnalyzer';

// Dans le rendu :
{(() => {
  const linkAnalysis = analyzeTicketLink(lien_billetterie);

  if (linkAnalysis.show) {
    return (
      <a
        href={lien_billetterie}
        target="_blank"  // ✅ Nouvel onglet
        rel="noopener noreferrer"  // ✅ Sécurisé
        className={linkAnalysis.colorClass}
      >
        <Ticket className="w-5 h-5 inline mr-2" />
        {linkAnalysis.text}
      </a>
    );
  }

  // Si pas de lien valide, afficher badge informatif
  return <Badge>Entrée Libre ou Plus d'infos</Badge>;
})()}
```

### CultureEventAgendaCard.tsx
- Même système d'analyse appliqué
- Import de la fonction centralisée
- Rendu conditionnel identique

## Exemples de comportement

### Exemple 1 : Facebook
**URL :** `https://www.facebook.com/events/example-jazz-blues`
- ❌ **Bouton masqué** (contient "example")

**URL :** `https://www.facebook.com/events/123456789`
- ✅ **Affiche :** "Voir l'événement" (bleu Facebook)

### Exemple 2 : Tesketki
**URL :** `https://tesketki.tn/event/123`
- ✅ **Affiche :** "Réserver mes places" (orange)

### Exemple 3 : Site tunisien
**URL :** `https://www.marathoncarthage.tn`
- ✅ **Affiche :** "Site Officiel" (gris sobre)

### Exemple 4 : Eventbrite
**URL :** `https://www.eventbrite.com/e/mon-event`
- ✅ **Affiche :** "Réserver mes places" (orange)

### Exemple 5 : Lien invalide
**URL :** `null` ou `""` ou `"https://example.com"`
- ❌ **Bouton masqué**
- 💡 **Affiche badge :** "Entrée Libre" (si prix = 0) ou "Plus d'infos sur place"

## Sécurité

1. **Tous les liens s'ouvrent dans un nouvel onglet** : `target="_blank"`
2. **Protection contre les attaques** : `rel="noopener noreferrer"`
3. **Validation des URLs** : Les liens contenant "example" ou "description" sont automatiquement masqués
4. **Fallback sécurisé** : Si pas de lien valide, affichage d'un badge informatif au lieu d'un bouton cassé

## Test des données

Pour tester le système, ajoutez des événements dans Supabase avec différents types d'URLs :

```sql
INSERT INTO culture_events (titre, ville, date_debut, lien_billetterie)
VALUES
  ('Concert Jazz', 'Tunis', NOW() + INTERVAL '5 days', 'https://www.facebook.com/events/12345'),
  ('Marathon', 'Sousse', NOW() + INTERVAL '10 days', 'https://tesketki.tn/marathon-2024'),
  ('Festival', 'Carthage', NOW() + INTERVAL '30 days', 'https://www.festivalcarthage.tn'),
  ('Atelier', 'Sfax', NOW() + INTERVAL '7 days', NULL);
```

## Résultat

Le système fonctionne **automatiquement** sans intervention manuelle :
- ✅ Détection intelligente du type de plateforme
- ✅ Adaptation automatique du texte et de la couleur
- ✅ Sécurité renforcée contre les liens invalides
- ✅ Ouverture sécurisée dans un nouvel onglet
- ✅ Expérience utilisateur optimale
