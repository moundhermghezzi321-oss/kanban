# Tableau Kanban

Un tableau Kanban pour organiser ses tâches en trois colonnes : **À faire**, **En cours**, **Terminé**.
Réalisé en **HTML, CSS et JavaScript natif**, sans framework ni bibliothèque.

## Fonctionnalités

- Ajouter une tâche avec une priorité (haute, moyenne, basse)
- Déplacer les tâches par glisser-déposer (ordinateur) ou avec les flèches (mobile)
- Modifier le titre d'une tâche directement sur la carte
- Rechercher une tâche
- Barre de progression (pourcentage de tâches terminées)
- Sauvegarde automatique dans le navigateur (`localStorage`)
- Design responsive et mode sombre automatique

## Ce que j'ai appris

- Manipuler le DOM et utiliser les `<template>` HTML
- La délégation d'événements (un seul écouteur pour toutes les cartes)
- L'API Drag and Drop de HTML5
- Séparer les données (`tasks`) de l'affichage (`render()`)
- Enregistrer des données avec `localStorage` et gérer les erreurs

## Lancer le projet

Aucune installation : ouvrir `index.html` dans un navigateur.

## Structure

```
index.html   structure de la page
style.css    mise en forme, responsive, mode sombre
app.js       logique : données, affichage, événements
```
