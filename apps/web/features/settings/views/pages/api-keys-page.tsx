"use client"

import { useState, useEffect, useCallback } from "react"
import { Key, Plus, Trash2, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ApiKey } from "../../types"
import {
  getApiKeysAction,
  revokeApiKeyAction,
} from "../../actions/api-keys-action"
import { GenerateKeyModal } from "../dialogs/generate-key-modal"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso))
}

function PermissionBadge({ perm }: { perm: string }) {
  const colors: Record<string, string> = {
    "analyses:read": "bg-blue-100 text-blue-700",
    "analyses:write": "bg-green-100 text-green-700",
    "dossiers:read": "bg-muted text-muted-foreground",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        colors[perm] ?? "bg-muted text-muted-foreground",
      )}
    >
      {perm}
    </span>
  )
}

function MaskedKey({ prefix }: { prefix: string }) {
  return (
    <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
      {prefix}••••••••
    </code>
  )
}

export function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showGenerate, setShowGenerate] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const loadKeys = useCallback(async () => {
    setLoading(true)
    try {
      setKeys(await getApiKeysAction())
    } catch {
      setError("Impossible de charger les clés API")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadKeys()
  }, [loadKeys])

  const handleRevoke = async (keyId: string) => {
    setRevokingId(keyId)
    try {
      await revokeApiKeyAction(keyId)
      setKeys((prev) => prev.filter((k) => k.id !== keyId))
    } catch {
      setError("Erreur lors de la révocation de la clé")
    } finally {
      setRevokingId(null)
    }
  }

  const activeKeys = keys.filter((k) => k.is_active)

  const filtered = search.trim()
    ? activeKeys.filter(
        (k) =>
          k.nom.toLowerCase().includes(search.toLowerCase()) ||
          k.permissions.some((p) =>
            p.toLowerCase().includes(search.toLowerCase()),
          ),
      )
    : activeKeys

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clés API</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {loading
              ? "…"
              : `${activeKeys.length} clé${activeKeys.length !== 1 ? "s" : ""} active${activeKeys.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={() => setShowGenerate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="w-4 h-4" />
          Générer une clé
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Rechercher par nom ou permission…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="px-5 py-3">Nom</TableHead>
                <TableHead className="px-5 py-3">Clé</TableHead>
                <TableHead className="px-5 py-3">Permissions</TableHead>
                <TableHead className="px-5 py-3">Expire le</TableHead>
                <TableHead className="px-5 py-3">
                  Dernière utilisation
                </TableHead>
                <TableHead className="px-5 py-3">Créée le</TableHead>
                <TableHead className="px-5 py-3" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 shrink-0">
                        <Key className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {key.nom}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-3.5">
                    <MaskedKey prefix={key.key_prefix} />
                  </TableCell>
                  <TableCell className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {key.permissions.map((p) => (
                        <PermissionBadge key={p} perm={p} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-sm text-muted-foreground">
                    {formatDate(key.expires_at)}
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-sm text-muted-foreground">
                    {formatDate(key.last_used_at)}
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-sm text-muted-foreground">
                    {formatDate(key.created_at)}
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleRevoke(key.id)}
                      disabled={revokingId === key.id}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
                      title="Révoquer cette clé"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-muted-foreground"
                  >
                    {activeKeys.length === 0
                      ? "Aucune clé API active. Générez votre première clé pour commencer."
                      : "Aucune clé ne correspond à votre recherche."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {showGenerate && (
        <GenerateKeyModal
          onClose={() => setShowGenerate(false)}
          onCreated={loadKeys}
        />
      )}
    </div>
  )
}
