# Guide de Test - Page Rapports

## Prérequis

1. Démarrer le serveur de développement :
```bash
npm run dev
```

2. Se connecter à l'application (créer un compte si nécessaire)

3. Ajouter quelques entrées de temps pour tester les exports :
   - Aller sur `/dashboard/timesheet`
   - Ajouter des heures pour différents projets et différents jours

## Tests à Effectuer

### 1. Test Rapport Hebdomadaire

**Objectif** : Vérifier que le rapport de la semaine en cours est généré en PDF

**Étapes** :
1. Naviguer vers `/dashboard/reports`
2. Cliquer sur la carte "Rapport Hebdomadaire" (icône calendrier)
3. Un fichier PDF devrait se télécharger automatiquement

**Vérifications** :
- ✅ Le fichier se nomme `rapport-hebdomadaire-YYYY-MM-DD.pdf`
- ✅ Le PDF contient un tableau avec les colonnes Lun-Dim
- ✅ Les projets sont listés avec leurs heures par jour
- ✅ Les totaux par jour et par projet sont corrects
- ✅ Le total général est affiché

---

### 2. Test Rapport Mensuel

**Objectif** : Vérifier que le rapport du mois en cours est généré en PDF

**Étapes** :
1. Sur `/dashboard/reports`
2. Cliquer sur la carte "Rapport Mensuel" (icône graphique)
3. Un fichier PDF devrait se télécharger

**Vérifications** :
- ✅ Le fichier se nomme `rapport-mensuel-janvier-2026.pdf` (ou le mois actuel)
- ✅ Le PDF contient toutes les entrées du mois
- ✅ Les totaux sont corrects

---

### 3. Test Export Personnalisé - PDF

**Objectif** : Créer un rapport personnalisé au format PDF

**Étapes** :
1. Sur `/dashboard/reports`
2. Cliquer sur la carte "Export Personnalisé" (icône download)
3. Un modal devrait s'ouvrir
4. Sélectionner une date de début (ex: 2026-01-01)
5. Sélectionner une date de fin (ex: 2026-01-15)
6. Vérifier que le format PDF est sélectionné (par défaut)
7. Cliquer sur "Exporter"

**Vérifications** :
- ✅ Le modal s'ouvre correctement avec le style glassmorphism
- ✅ Les inputs de date sont fonctionnels
- ✅ Le bouton PDF est actif par défaut (surligné en violet)
- ✅ Le modal se ferme après export
- ✅ Le fichier se nomme `rapport-personnalise-2026-01-01-2026-01-15.pdf`
- ✅ Le PDF contient les données de la période sélectionnée

---

### 4. Test Export Personnalisé - Excel

**Objectif** : Créer un rapport personnalisé au format Excel

**Étapes** :
1. Cliquer sur "Export Personnalisé"
2. Sélectionner une période
3. Cliquer sur le bouton "Excel" pour changer le format
4. Cliquer sur "Exporter"

**Vérifications** :
- ✅ Le bouton Excel devient actif (surligné en violet)
- ✅ Le fichier se nomme `rapport-personnalise-YYYY-MM-DD-YYYY-MM-DD.xlsx`
- ✅ Le fichier Excel s'ouvre correctement
- ✅ Les données sont structurées avec des formules pour les totaux
- ✅ Les colonnes sont bien dimensionnées

---

### 5. Test Bouton Export - PDF

**Objectif** : Export rapide de la semaine en cours en PDF

**Étapes** :
1. Sur `/dashboard/reports`
2. Cliquer sur le bouton "Exporter" en haut à droite
3. Un menu dropdown devrait apparaître
4. Cliquer sur "Export PDF"

**Vérifications** :
- ✅ Le dropdown s'affiche avec le style glassmorphism
- ✅ L'icône de fichier PDF est visible
- ✅ Le fichier se nomme `export-YYYY-MM-DD.pdf`
- ✅ Le PDF contient les données de la semaine en cours

---

### 6. Test Bouton Export - Excel

**Objectif** : Export rapide de la semaine en cours en Excel

**Étapes** :
1. Cliquer sur "Exporter" > "Export Excel"

**Vérifications** :
- ✅ Le fichier se nomme `export-YYYY-MM-DD.xlsx`
- ✅ Le fichier Excel contient les données de la semaine

---

### 7. Test Validations du Modal

**Objectif** : Vérifier les validations des champs

**Étapes** :
1. Ouvrir "Export Personnalisé"
2. Cliquer sur "Exporter" sans remplir les dates
3. Une alerte devrait apparaître : "Veuillez sélectionner une période"
4. Sélectionner une date de début postérieure à la date de fin
5. Cliquer sur "Exporter"
6. Une alerte devrait apparaître : "La date de début doit être antérieure à la date de fin"

**Vérifications** :
- ✅ Les validations fonctionnent
- ✅ Les messages d'erreur sont clairs

---

### 8. Test Interface & UX

**Objectif** : Vérifier l'expérience utilisateur

**Vérifications** :
- ✅ Les cartes ont un effet hover (bordure violet + ombre)
- ✅ Le curseur devient un pointeur sur les cartes
- ✅ Le bouton "Exporter" affiche "Export en cours..." pendant le traitement
- ✅ Le modal peut se fermer avec la touche Escape
- ✅ Le modal peut se fermer en cliquant sur le backdrop
- ✅ Le dropdown se ferme en cliquant à l'extérieur
- ✅ Les animations sont fluides (fade-in, scale-in)
- ✅ Le style respecte le design system (violet glassmorphism)

---

### 9. Test Responsive

**Objectif** : Vérifier l'adaptation mobile/tablette

**Étapes** :
1. Redimensionner la fenêtre du navigateur
2. Tester sur mobile (375px)
3. Tester sur tablette (768px)

**Vérifications** :
- ✅ Les 3 cartes passent en colonne sur mobile (grid-cols-1)
- ✅ Le modal est responsive et reste lisible
- ✅ Les inputs de date sont fonctionnels sur mobile

---

### 10. Test Cas Limites

**Scénarios à tester** :

1. **Aucune entrée de temps**
   - Exporter un rapport sur une période sans données
   - ✅ Le PDF/Excel doit se générer avec 0 heures

2. **Grande quantité de données**
   - Ajouter de nombreuses entrées sur plusieurs projets
   - ✅ Le rapport doit se générer sans erreur

3. **Projets avec caractères spéciaux**
   - Tester avec des noms de projets contenant des accents, apostrophes
   - ✅ Les caractères doivent s'afficher correctement

---

## Bugs Connus / Améliorations

- [ ] Le nom "Utilisateur" est hardcodé (TODO: récupérer le vrai nom)
- [ ] Pas de feedback visuel pendant le chargement des données
- [ ] Pas de prévisualisation avant export

## Checklist Complète

- [ ] Rapport Hebdomadaire (PDF)
- [ ] Rapport Mensuel (PDF)
- [ ] Export Personnalisé (PDF)
- [ ] Export Personnalisé (Excel)
- [ ] Export rapide PDF
- [ ] Export rapide Excel
- [ ] Validations du modal
- [ ] Interface & Animations
- [ ] Responsive design
- [ ] Cas limites

---

## En Cas de Problème

### Le téléchargement ne se lance pas
- Vérifier la console navigateur (F12)
- Vérifier que les données sont bien récupérées depuis l'API
- Vérifier que jspdf et xlsx sont installés

### Erreur "Failed to fetch"
- Vérifier que le serveur dev est bien démarré
- Vérifier l'URL de l'API dans la requête fetch

### Le PDF/Excel est vide
- Vérifier qu'il y a bien des entrées de temps dans la période
- Vérifier les logs de la fonction `transformToTimesheetData()`

### Erreur TypeScript
```bash
npm run build
```
Doit compiler sans erreur.
