# Wany — Site Vitrine

Site vitrine moderne et premium pour Wany, créateur web indépendant.

## 🚀 Personnalisation

### Modifier les projets

Les projets sont situés dans la section `<section id="projects">` du fichier `index.html`. Chaque projet est structuré ainsi :

```html
<div class="project-card">
    <div class="project-image p-barbie">
        <div class="project-monogram">CB</div>
    </div>
    <div class="project-content">
        <div class="project-type">Coaching sportif &amp; nutrition</div>
        <h3 class="project-title">Coach Barbie</h3>
        <p class="project-description">Un site complet pour une coach sportive : présentation, programmes, nutrition sur-mesure et espace élève privé avec paiement sécurisé.</p>
        <a href="https://wanycode.github.io/coach-barbie/" target="_blank" rel="noopener" class="project-link">Voir le site →</a>
    </div>
</div>
```

Pour changer le visuel d'un projet, remplacez `p-barbie` par `p-nono` ou `p-yujiro` (dégradés définis dans `styles.css`) et personnalisez le monogramme (ex. `CB`, `NC`, `YG`).

### Modifier les liens de contact

Les liens de contact sont dans la section `<section id="contact">` :

- **Email** : `mailto:ytop2sinj@gmail.com`
- **Instagram** : `https://instagram.com/wn.1r3`

### Modifier les informations de base

Ces informations se trouvent dans le `<head>` de `index.html` :

- **Titre** : `<title>Wany — Créateur Web Indépendant</title>`
- **Description** : `<meta name="description" content="...">`
- **URLs** : Remplacez `https://wany.fr/` par votre domaine réel (les 3 projets pointent déjà vers `wanycode.github.io`)

### Couleurs et styles

Les couleurs sont définies dans `styles.css` dans la section `:root` :

```css
:root {
    --bg-primary: #0a0a0a;      /* Fond principal */
    --bg-secondary: #111111;    /* Fond secondaire */
    --accent: #6366f1;         /* Couleur d'accentuation */
    --gradient: linear-gradient(...); /* Dégradé principal */
}
```

## 📱 Optimisation Mobile

Le site est déjà optimisé pour mobile avec :
- Design responsive
- Navigation mobile avec menu hamburger
- Tailles de police adaptatives
- Mises en page flexibles

## 🎨 Fonctionnalités

- **Animations au scroll** : Les éléments apparaissent progressivement (stagger par rangée)
- **Effets de survol** : Micro-interactions sur les cartes (désactivées sur écrans tactiles)
- **Glassmorphism** : Effets de verre modernes
- **Navigation fluide** : Défilement smooth vers les sections
- **Barre de progression** : Indicateur de scroll en haut de page
- **Optimisé performance** : Police non-bloquante, `content-visibility`, blur réduit sur mobile

## 📁 Structure du projet

```
presentation/
├── index.html          # Structure HTML principale
├── styles.css          # Styles et animations
├── script.js           # Interactions et animations JS
├── favicon.svg         # Icône du site
├── og-image.svg        # Image pour partage social
└── README.md           # Ce fichier
```

## 🔧 Déploiement

Pour publier le site :

1. **Hébergement statique** : Netlify, Vercel, GitHub Pages
2. **Hébergement traditionnel** : Uploader les fichiers sur votre serveur
3. **Domaine** : Configurer votre domaine (ex: wany.fr)

## 🎯 Prochaines étapes suggérées

1. Ajouter de vraies captures d'écran des projets (remplacer les monogrammes)
2. Configurer votre domaine (ex: wany.fr)
3. Tester le site sur différents appareils