# Système de Compteur de Vues - Dalil Tounes

## Date d'implémentation
8 février 2026

## Vue d'ensemble

Système professionnel de tracking des vues pour mesurer l'impact et prouver les résultats aux clients.

---

## 📊 Base de données

### Colonne ajoutée
- **Table** : `entreprise`
- **Colonne** : `views_count` (integer, défaut: 0)
- **Index** : Créé pour optimiser les performances

### Fonction Supabase
```sql
increment_entreprise_views(entreprise_id uuid)
```
- Incrémente automatiquement le compteur
- Sécurisée et accessible publiquement
- Retourne le nouveau nombre de vues

---

## 🔄 Système d'incrémentation

### Protection Anti-Spam
Le système intègre **3 niveaux de protection** :

1. **Délai d'engagement** : 2 secondes
   - L'utilisateur doit rester sur la page 2 secondes avant que la vue soit comptée
   - Élimine les clics accidentels et les bots rapides

2. **Cooldown localStorage** : 30 secondes
   - Une même personne ne peut compter qu'une vue par entreprise toutes les 30 secondes
   - Stocké localement dans le navigateur
   - Empêche les rafraîchissements multiples

3. **Tracking unique par session**
   - Une seule incrémentation par entreprise par session utilisateur
   - Reset automatique si l'utilisateur quitte et revient

### Fichier implémenté
`src/hooks/useViewTracking.ts`

### Intégration
Automatiquement activé dans `BusinessDetail.tsx` :
```typescript
useViewTracking(businessId);
```

---

## 👁️ Affichage ADMIN

### Où voir les statistiques ?

**Page Sourcing Terrain** (`/admin-sourcing`)
- Compteur visible dans les popups de la carte
- Format : 👁️ **154 vues** (bleu discret)
- Affiché uniquement si `views_count > 0`

### Format d'affichage
```
👁️ 154 vues    (si > 1)
👁️ 1 vue       (singulier)
```

### Icône
- Lucide React `Eye`
- Couleur : `text-blue-600`
- Taille : 12px (w-3 h-3)

---

## 🔒 Sécurité et confidentialité

### Visibilité
- ✅ **ADMIN** : Visible sur `/admin-sourcing`
- ❌ **PUBLIC** : Jamais affiché aux visiteurs
- ❌ **ENTREPRISES** : Pas visible dans les fiches publiques

### Permissions
- **Lecture** : Publique (pour le tracking)
- **Écriture** : Via fonction `increment_entreprise_views()` uniquement
- **Modification manuelle** : Admin Supabase uniquement

---

## ⚡ Performance

### Impact sur le chargement
- **Tracking asynchrone** : N'impacte PAS le temps de chargement de la page
- **Échec silencieux** : Si la requête échoue, l'utilisateur ne voit rien
- **Optimisé** : Index sur `views_count` pour tri rapide

### Ressources
- Aucun impact visuel sur la fiche entreprise
- Pas de requête bloquante
- localStorage pour le cache anti-spam

---

## 📈 Utilisation marketing

### Arguments de vente
1. "Votre fiche a été consultée **154 fois** ce mois"
2. "Vous êtes dans le **top 10** des entreprises les plus vues"
3. "Taux de conversion : X appels pour Y vues"

### Rapports possibles
- Top 10 entreprises par vues
- Évolution des vues par période
- Taux de conversion (vues → appels/emails)
- Comparaison avant/après abonnement Premium

---

## 🛠️ Fichiers modifiés

### Nouveaux fichiers
- `src/hooks/useViewTracking.ts` - Hook de tracking
- `supabase/migrations/xxx_create_increment_views_function.sql` - Fonction BDD

### Fichiers modifiés
- `src/pages/BusinessDetail.tsx` - Intégration du tracking
- `src/pages/AdminSourcing.tsx` - Affichage admin + récupération views_count
- `supabase/migrations/xxx_add_views_count_to_entreprise.sql` - Déjà existant

---

## ✅ Tests recommandés

1. Ouvrir une fiche entreprise → Attendre 2s → Vérifier incrémentation
2. Rafraîchir la page plusieurs fois → Vérifier qu'une seule vue est comptée
3. Ouvrir en navigation privée → Vérifier nouveau comptage
4. Vérifier l'affichage admin dans `/admin-sourcing`

---

## 🚀 Prochaines évolutions possibles

- **Dashboard analytics** : Graphiques d'évolution des vues
- **Notifications** : Alertes quand une entreprise atteint X vues
- **Rapports automatiques** : Envoi mensuel aux clients Premium
- **Comparaison concurrent** : Position relative dans la catégorie
- **Heat map** : Visualisation géographique des vues

---

## 📝 Notes techniques

### Pourquoi localStorage ?
- Plus rapide que les cookies
- Pas d'impact sur les requêtes serveur
- Persiste entre les sessions
- 30 secondes est un bon équilibre entre précision et anti-spam

### Pourquoi 2 secondes de délai ?
- Élimine les bots (< 1s sur page)
- Élimine les clics accidentels
- Confirme l'engagement réel
- Standard industrie (Google Analytics = 10s)

---

## Support

Pour toute question technique :
- Vérifier que `views_count` existe dans la table `entreprise`
- Vérifier que la fonction `increment_entreprise_views` est créée
- Consulter la console navigateur pour les erreurs silencieuses
