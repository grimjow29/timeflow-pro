# TimeFlow Pro - Todo List

## État du Projet
- **Version actuelle**: v0.2.0
- **Environnement**: Development
- **Dernière mise à jour**: 2026-01-19

---

## Tâches Terminées ✅

### [x] Page Équipe - Correction et amélioration
**Date**: 2026-01-19
**Détails**:
- Analyse de la page `/dashboard/team` existante
- Identification: la page chargeait correctement mais manquait de fonctionnalité "Ajouter membre"
- Ajout du bouton "Ajouter un membre" avec modal complet
- Création du formulaire avec champs: Email, Nom, Rôle (dropdown), Groupe (dropdown)
- Amélioration visuelle des cartes membres avec:
  - Badges de rôle colorés (ADMIN: rouge, MANAGER: amber, VALIDATOR: vert, EMPLOYEE: bleu)
  - Actions hover (éditer/supprimer)
  - Icônes pour chaque champ
  - Compteurs sur filtres de groupes
  - Meilleur layout responsive
- Implémentation API POST /api/users avec:
  - Validation email/nom requis
  - Vérification email unique
  - Validation des rôles (ADMIN, MANAGER, EMPLOYEE, VALIDATOR)
  - Storage session pour nouveaux membres
- Glassmorphism violet cohérent avec le design system
- Gestion d'erreurs avec bannière dismissible

**Fichiers modifiés**:
- `/src/app/(dashboard)/dashboard/team/page.tsx` (complètement refactorisé)
- `/src/app/api/users/route.ts` (ajout POST endpoint)

**État technique**:
- API: `/api/users` GET et POST fonctionnels
- API: `/api/groups` GET et POST existants
- Composants UI: Badge, GlassCard utilisés
- Icons: Lucide-react (Plus, X, Loader2, Users, Mail, UserCircle, Shield, Edit2, Trash2)

---

## Tâches En Cours 🔄

Aucune tâche en cours pour le moment.

---

## Corrections Récentes (2026-01-19) ✅

### [x] Bug Fixes Critiques
**Date**: 2026-01-19
**Détails**:

1. **Timesheet - Chargement des projets**
   - Problème: Race condition, projets ne chargeaient pas
   - Solution: Utilisation de `/api/projects` au lieu de Supabase direct
   - Fichier: `/src/app/(dashboard)/dashboard/timesheet/page.tsx`

2. **Validations - Bouton "Voir détails"**
   - Problème: Bouton sans onClick, ne faisait rien
   - Solution: Ajout d'un modal complet avec détails de l'approbation
   - Fichier: `/src/app/(dashboard)/dashboard/approvals/page.tsx`

3. **Validations - Filtre PENDING manquant**
   - Problème: La page affichait toutes les approbations
   - Solution: Ajout du filtre `?status=PENDING` dans l'API call
   - Fichier: `/src/app/(dashboard)/dashboard/approvals/page.tsx`

4. **Sidebar - Badge non dynamique**
   - Problème: Badge ne se mettait pas à jour après approbation
   - Solution: Event listener 'approvals-updated' + refresh automatique
   - Fichiers: `/src/components/layout/sidebar.tsx`, `/src/app/(dashboard)/dashboard/approvals/page.tsx`

5. **API Approvals - Persistance en mode démo**
   - Problème: Les approbations traitées réapparaissaient
   - Solution: Ajout de `markApprovalAsProcessed()` et `isApprovalProcessed()`
   - Fichiers: `/src/lib/mock-data.ts`, `/src/app/api/approvals/[id]/approve/route.ts`, `/src/app/api/approvals/[id]/reject/route.ts`, `/src/app/api/approvals/route.ts`

**Tests Playwright effectués**:
- ✅ Timesheet charge avec 5 projets et entrées de temps
- ✅ Modal "Voir détails" s'ouvre avec toutes les informations
- ✅ Approbation depuis le modal fonctionne
- ✅ Badge se met à jour immédiatement (1 → 0)
- ✅ Page affiche "Aucune validation en attente" après approbation

---

## Tâches À Venir ⏳

### Priorité Haute
- [ ] Implémenter la fonctionnalité d'édition de membre (bouton Edit2)
- [ ] Implémenter la suppression de membre (bouton Trash2)
- [ ] Ajouter confirmation modale pour suppression
- [ ] Tester l'accessibilité (navigation clavier, screen readers)

### Priorité Moyenne
- [ ] Ajouter recherche/filtre par nom ou email
- [ ] Pagination si plus de 12 membres
- [ ] Upload d'avatar pour les membres
- [ ] Indicateur de connexion récente (dernière activité)

### Priorité Basse
- [ ] Export CSV de la liste des membres
- [ ] Envoi d'invitation par email
- [ ] Statistiques par groupe (heures travaillées)
- [ ] Historique des modifications

---

## Notes Techniques

### Design System
- **Couleurs primaires**: Violet (#8b5cf6, #a78bfa, #7c3aed)
- **Surface**: #1a1225 (surface), #251838 (surfaceHighlight)
- **Glassmorphism**: backdrop-blur + bordures transparentes
- **Badges**: success (emerald), warning (amber), error (red), info (blue)

### Architecture
- **Framework**: Next.js 14 App Router
- **UI**: React 18+ Client Components
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Data**: Mock data + session storage (temporaire)

### À Connecter Plus Tard
- Base de données Supabase pour persistance réelle
- Authentification avec rôles
- Permissions granulaires (qui peut ajouter/modifier/supprimer)
- WebSocket pour mises à jour en temps réel
