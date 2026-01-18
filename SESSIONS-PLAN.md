# PLAN SESSIONS PARALLELES - TIMEFLOW PRO
## 3 Jours pour Maximum Impact

---

# SESSION 1: UX MODERNE (Command Palette + Shortcuts)

## Fichiers EXCLUSIFS
- src/components/ui/command-palette.tsx (CREER)
- src/components/ui/keyboard-shortcuts.tsx (CREER)
- src/hooks/useKeyboardShortcuts.ts (CREER)
- src/app/(dashboard)/layout.tsx (MODIFIER - ajouter CommandPalette)

## Dependances a installer
```bash
npm install cmdk
```

## Taches
1. Installer cmdk (librairie command palette)
2. Creer CommandPalette component avec:
   - Recherche projets/time entries
   - Actions: Start timer, Stop timer, Add time, Go to page
   - Raccourcis affiches
3. Creer hook useKeyboardShortcuts:
   - Cmd+K: Ouvrir palette
   - Cmd+T: Start/Stop timer
   - Cmd+N: New time entry
   - Cmd+P: Go to projects
   - Cmd+Shift+S: Submit timesheet
4. Integrer dans layout dashboard
5. Tester tous les raccourcis

## Commit
```bash
git commit -m "[SESSION-1] feat: command palette and keyboard shortcuts"
```

---

# SESSION 2: REAL-TIME & NOTIFICATIONS

## Fichiers EXCLUSIFS
- src/components/realtime/presence-indicator.tsx (CREER)
- src/components/realtime/team-activity.tsx (CREER)
- src/components/ui/notifications.tsx (CREER)
- src/hooks/usePresence.ts (CREER)
- src/hooks/useNotifications.ts (CREER)
- src/app/(dashboard)/dashboard/page.tsx (MODIFIER - ajouter presence)

## Taches
1. Configurer Supabase Realtime channel "presence"
2. Creer hook usePresence:
   - Track user online status
   - Track current project/timer
   - Broadcast presence changes
3. Creer PresenceIndicator component:
   - Avatar avec dot vert/gris
   - Tooltip avec projet actuel
4. Creer TeamActivity component:
   - Liste "Qui travaille maintenant"
   - Projet et duree en cours
5. Creer systeme notifications:
   - Toast notifications
   - Notification center (bell icon)
   - Types: approval_request, approval_result, reminder
6. Integrer dans dashboard et header

## Commit
```bash
git commit -m "[SESSION-2] feat: real-time presence and notifications"
```

---

# SESSION 3: EXPORT PDF/EXCEL

## Fichiers EXCLUSIFS
- src/lib/export/pdf-generator.ts (CREER)
- src/lib/export/excel-generator.ts (CREER)
- src/components/export/export-button.tsx (CREER)
- src/components/export/export-modal.tsx (CREER)
- src/app/api/export/pdf/route.ts (CREER)
- src/app/api/export/excel/route.ts (CREER)

## Dependances
```bash
npm install jspdf jspdf-autotable xlsx
```

## Taches
1. Creer PDF generator:
   - Header avec logo TimeFlow Pro
   - Infos utilisateur et periode
   - Tableau timesheet formatte
   - Totaux et statistiques
   - Footer avec date generation
2. Creer Excel generator:
   - Sheet "Timesheet" avec grille
   - Sheet "Summary" avec totaux
   - Formules Excel pour totaux
3. Creer ExportButton component
4. Creer ExportModal avec options:
   - Format: PDF / Excel
   - Periode: Semaine / Mois / Custom
   - Inclure: Details / Summary only
5. API routes pour generation serveur
6. Integrer dans page timesheet

## Commit
```bash
git commit -m "[SESSION-3] feat: PDF and Excel export"
```

---

# SESSION 4: ANALYTICS DASHBOARD

## Fichiers EXCLUSIFS
- src/components/analytics/time-chart.tsx (CREER)
- src/components/analytics/project-pie-chart.tsx (CREER)
- src/components/analytics/productivity-card.tsx (CREER)
- src/components/analytics/trends-chart.tsx (CREER)
- src/app/(dashboard)/dashboard/analytics/page.tsx (CREER)
- src/app/api/analytics/route.ts (CREER)

## Dependances
```bash
npm install recharts
```

## Taches
1. Creer API analytics:
   - Heures par jour (7 derniers jours)
   - Heures par projet (camembert)
   - Tendance semaine vs semaine precedente
   - Moyenne heures/jour
2. Creer TimeChart (bar chart heures/jour)
3. Creer ProjectPieChart (repartition projets)
4. Creer ProductivityCard:
   - Score productivite (vs objectif)
   - Comparaison semaine precedente
   - Streak (jours consecutifs)
5. Creer TrendsChart (ligne tendance)
6. Creer page Analytics complete
7. Ajouter lien dans sidebar

## Commit
```bash
git commit -m "[SESSION-4] feat: analytics dashboard with charts"
```

---

# SESSION 5: CALENDAR VIEW & TAGS

## Fichiers EXCLUSIFS
- src/components/calendar/calendar-view.tsx (CREER)
- src/components/calendar/calendar-day.tsx (CREER)
- src/components/calendar/time-entry-event.tsx (CREER)
- src/components/tags/tag-selector.tsx (CREER)
- src/components/tags/tag-badge.tsx (CREER)
- src/app/(dashboard)/dashboard/calendar/page.tsx (CREER)
- src/app/api/tags/route.ts (CREER)

## Taches DB (Supabase)
```sql
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#8b5cf6',
  user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.time_entries
ADD COLUMN tags UUID[] DEFAULT '{}';
```

## Taches
1. Creer CalendarView component:
   - Vue mois avec navigation
   - Cellules cliquables
   - Time entries comme events
2. Creer CalendarDay component
3. Creer TimeEntryEvent (mini carte dans cellule)
4. Creer systeme Tags:
   - API CRUD tags
   - TagSelector multi-select
   - TagBadge avec couleur
5. Integrer tags dans time entries
6. Creer page Calendar
7. Ajouter lien dans sidebar

## Commit
```bash
git commit -m "[SESSION-5] feat: calendar view and tags system"
```

---

# SESSION 6: AI & FEATURES AVANCEES

## Fichiers EXCLUSIFS
- src/lib/ai/time-suggestions.ts (CREER)
- src/lib/ai/productivity-score.ts (CREER)
- src/components/ai/smart-suggestions.tsx (CREER)
- src/components/goals/weekly-goal.tsx (CREER)
- src/components/goals/goal-progress.tsx (CREER)
- src/app/api/ai/suggestions/route.ts (CREER)

## Taches DB (Supabase)
```sql
ALTER TABLE public.profiles
ADD COLUMN weekly_goal_hours INTEGER DEFAULT 40,
ADD COLUMN settings JSONB DEFAULT '{}';
```

## Taches
1. Creer AI Time Suggestions:
   - Analyser patterns (meme jour/heure)
   - Suggerer projet probable
   - Suggerer duree basee sur historique
2. Creer Productivity Score:
   - Calcul: heures loggees / objectif
   - Bonus: regularite, pas d'overtime
   - Score 0-100 avec grade (A/B/C/D)
3. Creer SmartSuggestions component:
   - "Vous travaillez souvent sur X le lundi"
   - "Basé sur vos habitudes: 2h suggérées"
4. Creer Weekly Goal system:
   - Setting objectif heures/semaine
   - Progress bar visuelle
   - Celebration quand atteint
5. Integrer dans dashboard et timesheet

## Commit
```bash
git commit -m "[SESSION-6] feat: AI suggestions and goal tracking"
```

---

# SESSION 7: PWA & DARK MODE

## Fichiers EXCLUSIFS
- public/manifest.json (CREER)
- public/sw.js (CREER)
- src/components/ui/theme-toggle.tsx (CREER)
- src/hooks/useTheme.ts (CREER)
- src/app/layout.tsx (MODIFIER - theme provider)
- public/icons/ (CREER - app icons)

## Taches
1. Creer manifest.json PWA:
   - name, short_name, icons
   - theme_color, background_color
   - start_url, display: standalone
2. Creer service worker basique
3. Creer icones app (192x192, 512x512)
4. Creer ThemeToggle component:
   - Switch dark/light
   - Persist dans localStorage
   - Icone soleil/lune
5. Creer useTheme hook
6. Modifier Tailwind config pour themes
7. Tester installation PWA

## Commit
```bash
git commit -m "[SESSION-7] feat: PWA support and dark/light mode"
```

---

# ORDRE D'EXECUTION RECOMMANDE

## JOUR 1 (Aujourd'hui)
- Session 1: Command Palette ⬅️ PRIORITE
- Session 2: Real-time Presence
- Session 3: Export PDF/Excel

## JOUR 2
- Session 4: Analytics Dashboard
- Session 5: Calendar + Tags
- Session 7: PWA + Dark Mode

## JOUR 3
- Session 6: AI Features
- Tests complets
- Bug fixes
- Demo preparation

---

# REGLES IMPORTANTES

1. **NE JAMAIS** toucher aux fichiers des autres sessions
2. **TOUJOURS** pull avant de push
3. **COMMIT** avec le prefix de session
4. **TESTER** avant de push
