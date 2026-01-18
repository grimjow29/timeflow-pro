# TimeFlow Pro

**Application professionnelle de gestion du temps** - Time tracking moderne avec authentification Microsoft SSO.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-green?logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)

## Fonctionnalites

### Core Features
- **Timer en temps reel** - Chronometre avec persistence localStorage
- **Feuilles de temps** - Grille hebdomadaire editable avec totaux automatiques
- **Quick-add** - Boutons +15min, +30min, +1h pour ajout rapide
- **Projets & Sous-projets** - Hierarchie de projets avec budget et statuts

### Gestion d'equipe
- **Groupes utilisateurs** - Organisation par equipes
- **Roles** - Employee, Manager, Validator, Admin
- **Workflow de validation** - Soumission et approbation des timesheets

### Authentification
- **SSO Microsoft** - Authentification Azure AD via Supabase
- **Session securisee** - Middleware de protection des routes

## Quick Start

### Prerequis
- Node.js 18+
- Compte Supabase
- Azure AD (pour SSO Microsoft)

### Installation

```bash
# Cloner le repository
git clone https://github.com/grimjow29/timeflow-pro.git
cd timeflow-pro

# Installer les dependances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Editer .env.local avec vos credentials Supabase

# Lancer en developpement
npm run dev
```

### Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Architecture

```
src/
├── app/
│   ├── (auth)/login/          # Page de connexion
│   ├── (dashboard)/           # Pages protegees
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── timesheet/         # Feuilles de temps
│   │   ├── projects/          # Gestion projets
│   │   ├── team/              # Gestion equipe
│   │   ├── approvals/         # Validations
│   │   └── reports/           # Rapports
│   └── auth/callback/         # OAuth callback
├── components/
│   ├── ui/                    # Composants reutilisables
│   └── layout/                # Sidebar, Header
└── lib/
    ├── supabase/              # Clients Supabase
    ├── types.ts               # Types TypeScript
    └── utils.ts               # Utilitaires
```

## Design System

- **Theme** : Dark mode avec accents violet (#8b5cf6)
- **UI** : Glassmorphism avec effets blur
- **Animations** : Transitions fluides et micro-interactions

## Securite

- Row Level Security (RLS) sur toutes les tables
- Authentification cote serveur avec `getUser()`
- Middleware de protection des routes
- Validation des donnees avec Zod

## Stack Technique

| Categorie | Technologie |
|-----------|-------------|
| Framework | Next.js 14 (App Router) |
| Langage | TypeScript |
| Styling | Tailwind CSS |
| Auth & DB | Supabase |
| Icons | Lucide React |
| CI/CD | GitHub Actions |
| Hosting | Vercel |

## Scripts

```bash
npm run dev       # Serveur de developpement
npm run build     # Build de production
npm run start     # Serveur de production
npm run lint      # Linting ESLint
```

## Base de donnees

Le schema complet est disponible dans `supabase-schema.sql` :

- **profiles** - Utilisateurs avec roles
- **groups** - Groupes/equipes
- **projects** - Projets avec hierarchie
- **time_entries** - Entrees de temps
- **timesheet_approvals** - Workflow validation

## Deploiement

### Vercel (Recommande)

1. Connecter le repository GitHub a Vercel
2. Configurer les variables d'environnement
3. Deployer

### Configuration Azure AD

1. Creer une application dans Azure Portal
2. Configurer le Redirect URI : `https://[project].supabase.co/auth/v1/callback`
3. Ajouter les credentials dans Supabase Dashboard

## License

MIT

---

Developpe pour TimeFlow Pro
