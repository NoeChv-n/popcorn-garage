# 🍿 Popcorn Garage - Édition Fantastique

![Popcorn Garage 3D](https://img.shields.io/badge/Statut-Termin%C3%A9-success) ![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?logo=three.js) ![Déploiement](https://img.shields.io/badge/Déployé_sur-Netlify-00C7B7?logo=netlify)

**Lien vers le jeu en ligne :** https://popcorngarage.netlify.app

## 📖 À propos du projet

Popcorn Garage est une expérience web interactive en 3D inspirée du célèbre jeu du même nom. Pour cette édition, nous avons choisi d'explorer l'univers du **cinéma fantastique**. 

Le joueur est plongé dans un décor immersif représentant le célèbre grenier et l'armoire magique du *Monde de Narnia*. À l'intérieur, 13 objets cultes issus de films fantastiques ont été cachés. Le but du jeu ? Tous les retrouver, les inspecter et deviner à quel film ils appartiennent. À chaque bonne réponse, le joueur débloque une phrase emblématique du film.

## ✨ Fonctionnalités principales

*   **Exploration 3D Interactive :** Déplacement de la caméra et interaction avec les objets grâce au Raycaster de Three.js.
*   **Ambiance Immersive :** 
    *   Gestion de la lumière (effets d'ombres douces depuis une fenêtre).
    *   Système de particules (poussière flottante).
    *   Design sonore complet (vent spatialisé, effets de survol, musiques de succès et de victoire) via l'API Audio HTML5.
*   **Animations Fluides :** Mouvements de caméra cinématographiques réalisés avec GSAP.
*   **Modèles 3D Optimisés :** Réduction du *polycount* pour garantir une expérience fluide à 60 FPS sur navigateur (fichiers `.glb`).

## 👥 L'Équipe

Ce projet a été réalisé en équipe de 4 personnes :

*   **Noé Chauvin :** Développement WebGL (Three.js), animations (GSAP), design sonore et intégration générale de la scène.
*   **Hafsa Aboulfaid :** Modélisation 3D, texturing et conception des objets (Blender & outils de génération 3D).
*   **Douglas Quintero :** Gestion de la base de données, recherche des œuvres, des visuels et curation des citations emblématiques.
*   **Aaron Boti :** Optimisation des modèles 3D (réduction polygonale et allègement des assets pour le web).

## 🛠️ Technologies utilisées

*   **Frontend :** HTML5, CSS3, JavaScript (ES6)
*   **Moteur 3D :** [Three.js](https://threejs.org/)
*   **Animations :** [GSAP](https://greensock.com/gsap/)
*   **Outils 3D :** Blender
*   **Hébergement :** Déploiement continu via [Netlify](https://www.netlify.com/)

## 🚀 Installation en local

Si vous souhaitez faire tourner le projet sur votre machine :

1. Clonez ce dépôt :
   
```bash
   git clone [Lien de ton repo github]