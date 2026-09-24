# WANY — Sites web pour coachs sportifs

Landing page premium de **WANY**, studio web spécialisé dans la création de sites pour les
**coachs sportifs** (les indépendants restent bienvenus, en second plan).

> « Des sites qui transforment tes visiteurs en clients. »

Direction artistique : **Studio Noir** — encre `#0A0A0A` · papier `#F4F2ED` · signal `#FF5A1F`
Typographies : `Unbounded` (titres) · `Space Grotesk` (texte) · `JetBrains Mono` (labels)

Pas de framework ni de build : HTML, CSS et JavaScript. La **seule** dépendance externe est
Supabase, utilisée uniquement pour collecter et afficher les **avis clients**.

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

## Avis clients (Supabase)

Section `#avis`, placée entre le processus et le contact.

### Fonctionnement

1. Le visiteur ouvre le modal « Laisser un avis ».
2. Il saisit son prénom/nom, une note de **1 à 5 étoiles** et un commentaire.
3. À l'envoi, la ligne est insérée dans `public."business-reviews"` avec **`approved = false`**.
4. Le site public ne lit que les avis **`approved = true`** : rien ne s'affiche sans validation.

La lecture est filtrée sur **`site_id = SITE_ID`** **ET** `approved = true`, triée du plus récent
au plus ancien. L'avis d'un autre client ne peut donc jamais apparaître sur ce site.

Le site n'émet **aucune** requête de mise à jour ou de suppression : il ne peut que lire
(les avis approuvés) et insérer (des avis non approuvés).

### Configuration — nouveau site client

Tout se règle dans un seul bloc, en haut de `script.js` :

```js
const SUPABASE_URL = 'https://ahtfwbsvicdljpsveqra.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_...';
const REVIEWS_TABLE = 'business-reviews';
const SITE_ID = 'wany-studio';   /* ← identifiant de CE site */
```

Pour un nouveau client, change **uniquement `SITE_ID`** (ex. `'papafit'`).
⚠️ Un avis enregistré avec un `site_id` différent reste invisible sur ce site tant qu'il n'est
pas corrigé (depuis le dashboard : renseigne la colonne `site_id`).

Clé **publishable** uniquement côté navigateur — ne jamais mettre une clé `sb_secret_` ici.

### Modération

Les avis arrivent non approuvés. Pour publier : dashboard Supabase → table `business-reviews`
→ passer `approved` à `true`. Aucune autre action n'est nécessaire, le site se met à jour au
prochain chargement (recharge la page pour le voir apparaître).

⚠️ **Avant d'approuver, vérifie la colonne `site_id`** : elle doit valoir exactement `wany-studio`
(la valeur de `SITE_ID` dans `script.js`). Un avis approuvé dont le `site_id` est vide ou
différent restera **invisible** sur le site tant que la colonne `site_id` n'est pas corrigée
depuis le dashboard, et sans aucun message d'erreur. C'est la cause n°1 d'un avis « publié mais absent ».

Bonus : le tableau du dashboard affiche la colonne `approved`. Trie-la ou filtre sur `false`
pour ne voir que les avis en attente.

💡 **Tant qu'aucun avis n'est approuvé, la section affiche volontairement « Aucun avis publié
pour le moment » : ce n'est pas un bug**, c'est le comportement attendu. Dès qu'une ligne passe
à `approved = true` avec le bon `site_id`, elle apparaît et la note moyenne se calcule toute seule.

### Table

Le nom de la table contient un **tiret** : en SQL, il doit **toujours** être entre guillemets
(`public."business-reviews"`), sinon la requête échoue. Dans le Table Editor du dashboard,
ce problème ne se pose pas.

| Colonne      | Type        | Défaut   |
| ------------ | ----------- | -------- |
| `id`         | int8        | identity |
| `site_id`    | text        | —        |
| `name`       | text        | —        |
| `rating`     | int2        | —        |
| `review`     | text        | —        |
| `approved`   | bool        | `false`  |
| `created_at` | timestamptz | `now()`  |

### Durcissement conseillé (policy RLS)

La policy `INSERT WITH CHECK (true)` autorise n'importe quel contenu : le `approved: false`
envoyé par le site est une protection **côté client seulement**. Un appel direct à l'API REST
peut insérer `approved: true` et contourner la modération. Pour fermer cette faille :

```sql
create policy "insert non approuve" on public."business-reviews"
for insert with check (
    approved = false
    and rating between 1 and 5
    and char_length(btrim(coalesce(review, ''))) between 5 and 800
    and char_length(btrim(coalesce(site_id, ''))) >= 1
);
```

Les bornes `5` et `800` doivent **rester alignées** sur `REVIEW_MIN_LENGTH` et
`REVIEW_MAX_LENGTH` dans `script.js` : si tu changes l'une des deux constantes sans toucher à
la policy, des avis refusés par la base feront échouer l'envoi sans explication claire côté site.

⚠️ RLS est **permissif** : cette policy s'ajoute à celle qui existe déjà, elle ne la remplace
pas. Tant que l'ancienne `WITH CHECK (true)` est présente, la faille reste ouverte — il faut
la supprimer (dashboard → Authentication/Policies, ou `drop policy "<nom>" on public."business-reviews";`).
`site_id` non vide est imposé ici pour empêcher la création d'avis définitivement invisibles.

---

## Parcours de conversion

`coach → comprend l'offre → voit les prix → voit les créations → contacte WANY`

Les CTA renvoient vers `#offres` ou `#contact` : hero, barre de navigation, menu mobile,
grille tarifaire, section maintenance, créations et section contact.

---

## Structure du projet

```
presentation/
├── index.html     # Structure sémantique (hero, repères, studio, offres, maintenance, avis, contact…)
├── styles.css     # Feuille de styles « Studio Noir » + grille tarifaire + avis clients
├── script.js      # Reveal, menu mobile, compteurs, avis clients (Supabase), retour haut
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
- **Changer le site des avis** : la constante `SITE_ID` en haut de `script.js`.
- **Changer la longueur max d'un avis** : la constante `REVIEW_MAX_LENGTH` dans `script.js`
  (elle pilote à la fois le `maxlength` du champ et le compteur affiché).
