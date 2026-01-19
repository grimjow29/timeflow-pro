# Fonctionnalités de la Page Rapports

## Vue d'ensemble

La page Rapports (`/dashboard/reports`) permet aux utilisateurs de générer et exporter des rapports de temps au format PDF ou Excel.

## Fonctionnalités Implémentées

### 1. Rapport Hebdomadaire
- **Déclenchement** : Clic sur la carte "Rapport Hebdomadaire"
- **Comportement** : Génère automatiquement un PDF pour la semaine en cours (Lundi à Dimanche)
- **Format de fichier** : `rapport-hebdomadaire-YYYY-MM-DD.pdf`
- **Contenu** :
  - Heures par projet et par jour
  - Totaux par ligne (projet) et par colonne (jour)
  - Total général de la semaine

### 2. Rapport Mensuel
- **Déclenchement** : Clic sur la carte "Rapport Mensuel"
- **Comportement** : Génère automatiquement un PDF pour le mois en cours
- **Format de fichier** : `rapport-mensuel-mois-année.pdf`
- **Contenu** :
  - Analyse complète du mois
  - Répartition par projet
  - Totaux et statistiques

### 3. Export Personnalisé
- **Déclenchement** : Clic sur la carte "Export Personnalisé"
- **Comportement** : Ouvre un modal permettant de :
  - Sélectionner une période personnalisée (date de début et fin)
  - Choisir le format d'export (PDF ou Excel)
- **Format de fichier** : `rapport-personnalise-YYYY-MM-DD-YYYY-MM-DD.{pdf|xlsx}`

### 4. Bouton Export Rapide
- **Déclenchement** : Clic sur le bouton "Exporter" en haut à droite
- **Comportement** : Affiche un menu dropdown avec deux options :
  - Export PDF : Exporte la semaine en cours en PDF
  - Export Excel : Exporte la semaine en cours en Excel
- **Format de fichier** : `export-YYYY-MM-DD.{pdf|xlsx}`

## Composants Créés

### 1. `/src/components/ui/modal.tsx`
Modal réutilisable avec style glassmorphism violet, incluant :
- Animation d'entrée (scale-in)
- Backdrop avec blur
- Support de la touche Escape pour fermer
- Header, contenu et footer personnalisables

### 2. `/src/components/ui/dropdown.tsx`
Menu dropdown réutilisable avec :
- Positionnement aligné à gauche ou droite
- Fermeture au clic extérieur
- Items de menu stylisés
- Animation d'apparition

### 3. `/src/components/features/ExportCustomModal.tsx`
Modal spécialisé pour l'export personnalisé avec :
- Sélection de période (date début/fin)
- Choix du format (PDF/Excel)
- Validation des dates

### 4. `/src/hooks/useReports.ts`
Hooks personnalisés pour récupérer les données :
- `useTimeEntries()` : Récupère les entrées de temps avec filtres optionnels
- `useProjects()` : Récupère la liste des projets

### 5. `/src/lib/export/transform-data.ts`
Utilitaires pour transformer les données :
- `transformToTimesheetData()` : Transforme les entrées en format pour PDF/Excel
- `getCurrentWeek()` : Retourne le début et la fin de la semaine en cours
- `getCurrentMonth()` : Retourne le début et la fin du mois en cours
- `formatDateForAPI()` : Formate une date pour l'API (YYYY-MM-DD)
- `formatDate()` : Formate une date en français (DD/MM/YYYY)

## Flux de Données

1. **Récupération des projets** : Au chargement de la page via `useProjects()`
2. **Génération d'un rapport** :
   - Détermine la période (semaine, mois ou personnalisée)
   - Appelle l'API `/api/time-entries` avec les paramètres `week_start` et `week_end`
   - Transforme les données via `transformToTimesheetData()`
   - Appelle le générateur approprié (`downloadTimesheetPDF()` ou `downloadTimesheetExcel()`)
   - Télécharge le fichier automatiquement

## Intégration TanStack Query

Le projet utilise maintenant **TanStack Query (React Query)** pour la gestion des données :

- **Configuration** : `QueryClientProvider` dans `/src/components/layout/dashboard-client.tsx`
- **Options par défaut** :
  - `staleTime: 60000` (1 minute) - Les données restent "fraîches" pendant 1 minute
  - `refetchOnWindowFocus: false` - Pas de re-fetch automatique au focus de la fenêtre

## Styles

Tous les composants suivent le design system TimeFlow Pro :
- **Couleurs** : Palette violet (primary-400, primary-500, primary-600)
- **Effets** : Glassmorphism avec backdrop-blur
- **Animations** :
  - `fade-in` : Apparition avec translation verticale
  - `scale-in` : Apparition avec effet de zoom
- **Hover** : Effets de survol avec bordure et ombre

## API Utilisées

### GET `/api/time-entries`
Paramètres de requête :
- `week_start` (optionnel) : Date de début (YYYY-MM-DD)
- `week_end` (optionnel) : Date de fin (YYYY-MM-DD)
- `project_id` (optionnel) : Filtrer par projet

Retourne :
```json
{
  "data": [
    {
      "id": "entry-123",
      "user_id": "user-456",
      "project_id": "proj-789",
      "date": "2026-01-15",
      "duration": 480,
      "description": "...",
      "billable": true,
      "project": {
        "id": "proj-789",
        "name": "Projet A",
        "color": "#8b5cf6"
      }
    }
  ]
}
```

### GET `/api/projects`
Retourne la liste complète des projets avec leurs sous-projets.

## Améliorations Futures Possibles

1. **Nom d'utilisateur réel** : Récupérer le nom depuis le profil utilisateur au lieu de "Utilisateur"
2. **Prévisualisation** : Afficher un aperçu du rapport avant export
3. **Filtres avancés** : Filtrer par projet, client, type de tâche
4. **Templates personnalisés** : Permettre de créer des modèles de rapports
5. **Envoi par email** : Envoyer le rapport directement par email
6. **Rapports récurrents** : Programmer des exports automatiques
7. **Graphiques** : Ajouter des visualisations dans les PDFs
8. **Multi-langues** : Support de plusieurs langues pour les rapports

## Tests

Pour tester les fonctionnalités :

1. Démarrer le serveur : `npm run dev`
2. Naviguer vers `/dashboard/reports`
3. Tester chaque carte :
   - Rapport Hebdomadaire : Doit générer un PDF pour cette semaine
   - Rapport Mensuel : Doit générer un PDF pour ce mois
   - Export Personnalisé : Ouvre le modal et permet de choisir période + format
4. Tester le bouton Exporter :
   - Doit afficher un dropdown avec PDF et Excel
   - Chaque option doit exporter la semaine en cours
