Plan — Système de Notifications BARTHE Platform

     Context

     La plateforme BARTHE n'a pas de système de notifications structuré. Les utilisateurs doivent rafraîchir manuellement
     pour voir l'état d'une analyse asynchrone. L'objectif est d'ajouter un centre de notifications in-app (cloche + liste
     persistante) + emails pour les événements importants.

     Infrastructure existante à réutiliser :
     - apps/web/lib/mailer.tsx — Nodemailer + React Email (templates: invitation, reset, welcome)
     - Sonner — toasts éphémères côté client
     - AuditLog Prisma — tous les événements sont déjà loggés
     - ui/popover.tsx, ui/scroll-area.tsx — déjà dans le projet shadcn/ui

     ---
     1. Prisma Schema — nouveau modèle Notification

     Fichier : apps/web/prisma/schema.prisma

     enum NotificationType {
       ANALYSE_TERMINEE
       ANALYSE_ECHOUEE
       ALERTE_CRITIQUE
       RAPPORT_PRET
       DOSSIER_SUPPRIME
       TRIAL_EXPIRE_7J
       TRIAL_EXPIRE_3J
       TRIAL_EXPIRE_1J
       TRIAL_EXPIRE
       LIMITE_80
       LIMITE_100
       MEMBRE_REJOINT
       ROLE_MODIFIE
       COMPTE_DESACTIVE
       NOUVELLE_IP
       API_KEY_EXPIRE_7J
       API_KEY_PREMIERE_UTILISATION
     }

     model Notification {
       id             String           @id @default(cuid())
       user_id        String
       institution_id String
       type           NotificationType
       title          String
       message        String
       metadata       Json             @default("{}")
       is_read        Boolean          @default(false)
       email_sent     Boolean          @default(false)
       created_at     DateTime         @default(now())

       user           User             @relation(fields: [user_id], references: [id], onDelete: Cascade)
       institution    Institution      @relation(fields: [institution_id], references: [id], onDelete: Cascade)

       @@index([user_id, is_read])
       @@index([institution_id, created_at])
     }

     Ajouter la back-relation sur User et Institution :
     notifications  Notification[]

     ---
     2. Notifications à implémenter

     ┌──────┬──────────────────────────────┬────────────────┬──────────────────┬────────┬───────┐
     │ Code │          Événement           │  Déclencheur   │   Destinataire   │ In-app │ Email │
     ├──────┼──────────────────────────────┼────────────────┼──────────────────┼────────┼───────┤
     │ N01  │ Analyse terminée             │ Python webhook │ Créateur         │ ✅     │ ✅    │
     ├──────┼──────────────────────────────┼────────────────┼──────────────────┼────────┼───────┤
     │ N02  │ Analyse échouée              │ Python webhook │ Créateur         │ ✅     │ ✅    │
     ├──────┼──────────────────────────────┼────────────────┼──────────────────┼────────┼───────┤
     │ N03  │ Alerte critique              │ Python webhook │ Créateur + admin │ ✅     │ ❌    │
     ├──────┼──────────────────────────────┼────────────────┼──────────────────┼────────┼───────┤
     │ N04  │ Rapport PDF prêt             │ Python webhook │ Créateur         │ ✅     │ ❌    │
     ├──────┼──────────────────────────────┼────────────────┼──────────────────┼────────┼───────┤
     │ N05  │ Dossier supprimé             │ Server action  │ Admins           │ ✅     │ ❌    │
     ├──────┼──────────────────────────────┼────────────────┼──────────────────┼────────┼───────┤
     │ N06  │ Trial dans 7j                │ Cron           │ Admin            │ ✅     │ ✅    │
     ├──────┼──────────────────────────────┼────────────────┼──────────────────┼────────┼───────┤
     │ N07  │ Trial dans 3j                │ Cron           │ Admin            │ ✅     │ ✅    │
     ├──────┼──────────────────────────────┼────────────────┼──────────────────┼────────┼───────┤
     │ N08  │ Trial dans 1j                │ Cron           │ Admin            │ ✅     │ ✅    │
     ├──────┼──────────────────────────────┼────────────────┼──────────────────┼────────┼───────┤
     │ N09  │ Trial expiré                 │ Cron           │ Admin            │ ✅     │ ✅    │
     ├──────┼──────────────────────────────┼────────────────┼──────────────────┼────────┼───────┤
     │ N10  │ Limite 80%                   │ Server action  │ Admin            │ ✅     │ ❌    │
     ├──────┼──────────────────────────────┼────────────────┼──────────────────┼────────┼───────┤
     │ N11  │ Limite 100%                  │ Server action  │ Tous             │ ✅     │ ✅    │
     ├──────┼──────────────────────────────┼────────────────┼──────────────────┼────────┼───────┤
     │ N13  │ Nouveau membre               │ Server action  │ Admin            │ ✅     │ ❌    │
     ├──────┼──────────────────────────────┼────────────────┼──────────────────┼────────┼───────┤
     │ N14  │ Rôle modifié                 │ Server action  │ User concerné    │ ✅     │ ✅    │
     ├──────┼──────────────────────────────┼────────────────┼──────────────────┼────────┼───────┤
     │ N15  │ Compte désactivé             │ Server action  │ User concerné    │ ❌     │ ✅    │
     ├──────┼──────────────────────────────┼────────────────┼──────────────────┼────────┼───────┤
     │ N16  │ Nouvelle IP                  │ Server action  │ User             │ ❌     │ ✅    │
     ├──────┼──────────────────────────────┼────────────────┼──────────────────┼────────┼───────┤
     │ N17  │ Clé API expire 7j            │ Cron           │ Admin            │ ✅     │ ✅    │
     ├──────┼──────────────────────────────┼────────────────┼──────────────────┼────────┼───────┤
     │ N18  │ Première utilisation API key │ Python webhook │ Admin            │ ✅     │ ❌    │
     └──────┴──────────────────────────────┴────────────────┴──────────────────┴────────┴───────┘

     ---
     3. Architecture

     Flux principal — Analyse terminée (N01)

     Python analyses.py → POST /api/notifications/webhook (X-Internal-Secret)
       → webhook/route.ts → notification-service.createNotification()
         → INSERT Notification (in-app)
         → sendAnalyseTermineeEmail() [fire-and-forget]
       → SWR poll (30s) → NotificationBell badge update

     Flux cron — Trial expiry

     Cron 08h00 → GET /api/cron/notifications (Authorization: Bearer CRON_SECRET)
       → Fetch toutes institutions trial avec trial_end
       → Pour chaque admin: INSERT Notification + sendTrialExpirationEmail()
       → Guard idempotent: vérifie si notification déjà créée dans les 26h

     ---
     4. Fichiers à créer

     Core

     - apps/web/features/notifications/types/index.ts — types TypeScript
     - apps/web/features/notifications/services/notification-service.ts — createNotification, createNotificationsForAdmins,
      createNotificationsForAll, markAsRead, markAllAsRead, getNotifications, getUnreadCount
     - apps/web/features/notifications/actions/get-notifications-action.ts — server action
     - apps/web/features/notifications/actions/mark-read-action.ts — server action
     - apps/web/app/api/notifications/webhook/route.ts — endpoint pour Python (sécurisé par X-Internal-Secret)
     - apps/web/app/api/cron/notifications/route.ts — cron daily pour trial + API keys

     UI

     - apps/web/features/notifications/views/components/notification-bell.tsx — cloche avec badge SWR
     - apps/web/features/notifications/views/components/notification-panel.tsx — popover avec liste
     - apps/web/features/notifications/views/components/notification-item.tsx — une ligne de notification

     Email templates

     - apps/web/emails/analyse-terminee.tsx
     - apps/web/emails/trial-expiration.tsx (gère N06-N09 selon joursRestants)
     - apps/web/emails/role-modifie.tsx
     - apps/web/emails/nouvelle-ip.tsx
     - apps/web/emails/api-key-expiration.tsx
     - apps/web/emails/compte-desactive.tsx

     Python

     - apps/api/app/core/notifications.py — helper trigger_notification() fire-and-forget

     ---
     5. Fichiers à modifier

     - apps/web/prisma/schema.prisma — ajouter modèle + enum + back-relations
     - apps/web/components/app-toolbar.tsx — remplacer le bouton Bell statique par <NotificationBell />
     - apps/web/lib/mailer.tsx — 6 nouvelles fonctions send*Email
     - apps/web/lib/actions/delete-dossier-action.ts — N05 après suppression
     - apps/web/lib/actions/api-keys-action.ts — N18 si première utilisation
     - Settings/équipe actions — N13, N14, N15
     - Login action — N16 (nouvelle IP, comparer avec last known IP)
     - apps/api/app/routers/analyses.py — N01, N02, N03 via webhook
     - apps/api/app/routers/rapports.py — N04 via webhook
     - apps/api/app/routers/api_keys.py — N18 via webhook
     - apps/api/app/core/config.py — ajouter NEXT_INTERNAL_URL, INTERNAL_WEBHOOK_SECRET

     ---
     6. Hiérarchie UI

     AppToolbar (app-toolbar.tsx)
       └── NotificationBell (client component)
             ├── useSWR('notifications', getNotificationsAction, { refreshInterval: 30000 })
             ├── <Popover> (Radix, ancré à droite)
             │     ├── <PopoverTrigger>
             │     │     └── <Bell /> + badge rouge (count > 0)
             │     └── <PopoverContent w-96>
             │           └── NotificationPanel
             │                 ├── Header + "Tout marquer lu"
             │                 ├── <ScrollArea maxH-480px>
             │                 │     └── NotificationItem[]
             │                 │           ├── Icône colorée (NOTIFICATION_CONFIG[type])
             │                 │           ├── title + message
             │                 │           ├── temps relatif (date-fns)
             │                 │           └── point bleu si non lu
             │                 └── Empty state

     SWR : clé 'notifications' partagée entre Bell (count) et Panel (liste) → fetch dédupliqué. mutate optimiste après
     mark-read.

     ---
     7. Variables d'environnement

     # apps/web/.env.local
     CRON_SECRET=<random-32-chars>
     INTERNAL_WEBHOOK_SECRET=<random-32-chars>

     # apps/api/.env
     NEXT_INTERNAL_URL=http://localhost:3000
     INTERNAL_WEBHOOK_SECRET=<same-value>

     ---
     8. Ordre d'implémentation

     1. Migration Prisma (pnpm db:migrate)
     2. Types + notification-service.ts
     3. Email templates + mailer.tsx (parallèle)
     4. Server actions (get + mark-read)
     5. Webhook API route
     6. Cron API route
     7. UI components (Bell + Panel + Item)
     8. Modifier AppToolbar
     9. Trigger sites Next.js (delete-dossier, équipe, login, api-keys)
     10. Python : notifications.py + analyses.py + rapports.py + api_keys.py

     ---
     9. Vérification (tests end-to-end)

     1. Créer un dossier → lancer analyse → vérifier que cloche affiche +1 après max 30s
     2. Simuler une analyse échouée → vérifier notification N02 + email reçu
     3. Mettre trial_end à J+1 dans la DB → appeler /api/cron/notifications manuellement → vérifier notification N08
     4. Changer le rôle d'un user → vérifier notification N14 dans sa cloche
     5. Créer une ApiKey, l'utiliser via Python → vérifier notification N18 chez l'admin
