# Checklist Tests - Nouveau Projet

## Tests Fonctionnels

### Modal
- [ ] Le bouton "Nouveau Projet" ouvre le modal
- [ ] Cliquer sur backdrop ferme le modal
- [ ] Appuyer sur ESC ferme le modal
- [ ] Cliquer "Annuler" ferme le modal
- [ ] Le modal a l'animation scale-in
- [ ] Le backdrop a l'effet blur

### Formulaire
- [ ] Le champ "Nom" est autofocused
- [ ] Le champ "Nom" affiche * rouge (requis)
- [ ] Submit sans nom affiche erreur
- [ ] Les 8 couleurs s'affichent correctement
- [ ] Cliquer une couleur la sélectionne (ring blanc + scale)
- [ ] Le dropdown "Projet parent" contient les projets racines
- [ ] Le checkbox "Facturable" fonctionne
- [ ] Le champ "Taux horaire" apparaît seulement si facturable

### Validation
- [ ] Nom vide -> erreur "Le nom du projet est requis"
- [ ] Taux horaire négatif -> erreur
- [ ] Budget négatif -> erreur
- [ ] Erreurs disparaissent quand on tape

### Création
- [ ] Submit affiche spinner et "Création..."
- [ ] Bouton devient disabled pendant creation
- [ ] Succès: modal se ferme
- [ ] Succès: projet apparaît dans la liste
- [ ] Erreur API: modal reste ouvert

### Projet Créé
- [ ] Le nouveau projet a la bonne couleur
- [ ] Le nom s'affiche correctement
- [ ] La description s'affiche si remplie
- [ ] Le budget s'affiche si rempli
- [ ] Le statut est "ACTIF"

## Tests UI/UX

### Responsivité
- [ ] Modal adapté sur mobile
- [ ] Grid couleurs responsive
- [ ] Formulaire scrollable si petit écran

### Accessibilité
- [ ] Tab navigation fonctionne
- [ ] Focus visible sur tous les champs
- [ ] Labels associés aux inputs
- [ ] Bouton "Fermer" a aria-label

### Style
- [ ] Glassmorphism cohérent
- [ ] Couleurs primary-500/600 respectées
- [ ] Shadow sur bouton submit
- [ ] Transitions smooth

## Cas Limites

- [ ] Créer projet avec tous les champs vides sauf nom
- [ ] Créer projet avec tous les champs remplis
- [ ] Nom très long (100+ caractères)
- [ ] Description très longue
- [ ] Taux horaire avec décimales (75.50)
- [ ] Budget = 0 (devrait être invalide)
- [ ] Ouvrir modal, fermer, rouvrir -> formulaire reset

## Performance

- [ ] Modal s'ouvre instantanément (<100ms)
- [ ] Pas de lag lors de la sélection couleur
- [ ] Submit avec throttle/debounce
- [ ] Pas de double submit possible

## Intégration

- [ ] POST /api/projects reçoit les bonnes données
- [ ] Refresh de la liste après création
- [ ] Nouveau projet est expanded si a des children
- [ ] Peut créer un sous-projet (parent_id défini)

---

**Statut Global**: ⏳ À tester

**Priorité Haute**:
1. Modal ouvre/ferme
2. Création projet minimal (nom seul)
3. Refresh liste

**Priorité Moyenne**:
4. Validation erreurs
5. Champs conditionnels
6. Sélection couleur

**Priorité Basse**:
7. Accessibilité complète
8. Responsive mobile
9. Cas limites
