# WANY — Sites web pour coachs sportifs

Landing page premium de **WANY**, studio web spécialisé dans la création de sites pour les
**coachs sportifs** (les indépendants restent bienvenus, en second plan).

> « Des sites qui transforment tes visiteurs en clients. »

Direction artistique : **Studio Noir** — encre `#0A0A0A` · papier `#F4F2ED` · signal `#FF5A1F`
Typographies : `Unbounded` (titres) · `Space Grotesk` (texte) · `JetBrains Mono` (labels)

Aucun backend, aucune base de données : HTML, CSS et JavaScript uniquement.

---

## Offres

| Formule     | Prix         | Pour quoi                                        |
| ----------- | ------------ | ------------------------------------------------ |
| START       | 29,99 €      | une présence web propre et efficace              |
| PRO         | 59,99 €      | un site plus travaillé — formule recommandée     |
| PREMIUM     | 99,99 €      | une expérience web vraiment sur mesure           |
| MAINTENANCE | 9,99 €/mois  | optionnelle, sans engagement                     |

Hébergement inclus dans les trois formules.
Modifications : **2 séries** (START), **5 séries** (PRO), **illimitées pendant la phase de création** (PREMIUM).

---

## Parcours de conversion

`coach → comprend l'offre → voit les prix → voit les créations → contacte WANY`

Les CTA renvoient vers `#offres` ou `#contact` : hero, barre de navigation, menu mobile,
grille tarifaire, section maintenance, créations et section contact.

---

## Structure du projet

```
presentation/
├── index.html     # Structure sémantique (hero, repères, studio, offres, maintenance…)
├── styles.css     # Feuille de styles « Studio Noir » + grille tarifaire
├── script.js      # Reveal au scroll, menu mobile, compteurs, copie de l'email, retour haut
├── favicon.svg    # Favicon WANY
├── og-image.svg   # Carte de partage social
└── README.md
```

---

## Projets présentés (liens réels)

- **Malo MLV** — coaching & nutrition : <https://wanycode.github.io/malomlv/>
- **Atlas** — protocole entrepreneurs : <https://wanycode.github.io/coaching-ld/>
- **Papafit 4.0** — remise en forme 35 ans + : <https://wanycode.github.io/papafit/>

---

## Contact

- Email : `ytop2sinj@gmail.com`
- Instagram : <https://instagram.com/wn.1r3>

---

## Personnalisation

- **Modifier les prix** : dans `<section id="offres">`, chaque carte contient un `.plan__price`.
- **Ajouter un projet** : dupliquer un `<article class="work">` dans `<section id="creations">`.
- **Ajouter une prestation** : dupliquer un `<li class="cap">` dans `.caps__grid`.
