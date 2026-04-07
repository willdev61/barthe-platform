# Plan — Améliorations UI Espace App (utilisateur)

> Fichier de suivi. Cocher chaque tâche au fur et à mesure.

---

## Tâche 1 — Toolbar : hauteur alignée sur la sidebar + icône notification

**Fichiers concernés :** `components/app-toolbar.tsx`

- [x] Aligner la hauteur de la toolbar sur la section logo de la sidebar (`h-[76px]`).
- [x] Retirer l'avatar (initiales + dropdown utilisateur) de la toolbar.
- [x] Remplacer par une icône `Bell` (notification) — bouton simple pour l'instant, sans fonctionnalité.
- [x] Changer le fond de la toolbar : `bg-white border-b border-border`.

---

## Tâche 2 — User dropdown dans la sidebar (comme marketing-project)

**Fichiers concernés :** `components/sidebar.tsx`

- [x] Retirer "Paramètres" des `navItems` de la sidebar.
- [x] Transformer la section utilisateur en bas de sidebar en `DropdownMenu` (shadcn) qui s'ouvre vers le haut.
- [x] Contenu du dropdown : Mon profil / Paramètres / Se déconnecter.
- [x] Le trigger du dropdown = carte utilisateur (initiales + nom + email + `ChevronsUpDown`).

---

## Tâche 3 — Clés API en sidebar + Documentation API en menu

**Fichiers concernés :** `components/sidebar.tsx`, `app/(app)/settings/layout.tsx`

- [x] Ajouter dans la sidebar un groupe "Développeurs" avec `Key` → `/settings/api-keys`.
- [x] Retirer l'onglet "Clés API" du `SettingsLayout`.
- [x] La page `/settings/api-keys` reste telle quelle.
- [ ] Documentation API — page placeholder à créer si nécessaire.

---

## Tâche 4 — Paramètres : modification du profil utilisateur

**Fichiers créés/modifiés :**
- [x] `features/settings/views/dialogs/profile-dialog.tsx` — dialog 2 onglets (Infos + Mot de passe)
- [x] `components/sidebar.tsx` — bouton "Mon profil" câblé dans le dropdown

**Contenu de la dialog profil (2 onglets comme marketing-project) :**

### Onglet "Informations"
- Champ **Nom complet** — `auth.api.updateUser({ name })`
- Champ **Email** (lecture seule pour l'instant, changement trop risqué sans vérification)

### Onglet "Mot de passe"
- Champ **Mot de passe actuel**
- Champ **Nouveau mot de passe** (min 8 chars)
- Champ **Confirmer le mot de passe**
- Action : `authClient.changePassword({ currentPassword, newPassword })`

---

## Tâche 5 — Contenu pleine largeur (retirer max-w-3xl)

**Fichiers concernés :** `features/settings/views/pages/settings-page.tsx`, potentiellement d'autres pages

- [x] Retirer `max-w-3xl mx-auto` de la settings page et du settings layout.
- [ ] Vérifier les autres pages (`dashboard`, `dossiers`, etc.) et normaliser le padding.

---

## Ordre d'exécution recommandé

1. **Tâche 1** (toolbar) — rapide, visuel, impact immédiat
2. **Tâche 5** (pleine largeur) — rapide
3. **Tâche 2** (user dropdown sidebar) — dépend de Tâche 4 pour le lien "Mon profil"
4. **Tâche 4** (dialog profil) — nécessite les actions server
5. **Tâche 3** (API keys sidebar + doc) — indépendant

---

## Notes

- La toolbar ne doit plus avoir de logique utilisateur (déplacée dans le dropdown sidebar).
- L'icône `Bell` est un placeholder — les notifications réelles sont hors scope pour l'instant.
- L'email n'est pas modifiable directement (casse le compte better-auth sans flow de vérification).
- La dialog profil sera accessible depuis le dropdown sidebar ET depuis la settings page.
