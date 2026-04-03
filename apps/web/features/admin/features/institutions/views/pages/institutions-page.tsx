"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { Building2, Plus, Trash2, Loader2, Search, Clock, CheckCircle } from "lucide-react"
import ReactCountryFlag from "react-country-flag"
import { toast } from "sonner"
import type { AdminInstitution } from "@/features/admin/types"
import {
  getAdminInstitutions,
  updateInstitutionStatut,
  deleteAdminInstitution,
} from "../../services/admin-institution-service"
import { CreateInstitutionDialog } from "../components/create-institution-dialog"
import { PAYS, PAYS_ISO } from "../../constants"
import { formatDate } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function joursRestants(trialEnd: string | null): number | null {
  if (!trialEnd) return null
  return Math.max(
    0,
    Math.ceil(
      (new Date(trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    ),
  )
}

function TrialBadge({
  trialEnd,
  dossierLimit,
  nbDossiers,
}: {
  trialEnd: string | null
  dossierLimit: number | null
  nbDossiers: number
}) {
  const jours = joursRestants(trialEnd)
  const expired = jours !== null && jours <= 0
  const critical = expired || (jours !== null && jours <= 5)

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
          expired
            ? "bg-destructive/10 text-destructive"
            : critical
              ? "bg-orange-100 text-orange-700"
              : "bg-amber-100 text-amber-700",
        )}
      >
        <Clock className="w-3 h-3" />
        TRIAL
      </span>
      {jours !== null && (
        <span
          className={cn(
            "text-[10px]",
            expired ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {expired ? "Expiré" : `${jours}j restants`}
        </span>
      )}
      {dossierLimit !== null && (
        <span className="text-[10px] text-muted-foreground">
          {nbDossiers}/{dossierLimit} dossiers
        </span>
      )}
    </div>
  )
}

export function InstitutionsPage() {
  const { data, isLoading, mutate } = useSWR<AdminInstitution[]>(
    "admin-institutions",
    getAdminInstitutions,
  )
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState("")
  const [filterStatut, setFilterStatut] = useState("all")
  const [filterPays, setFilterPays] = useState("all")

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return (data ?? []).filter((inst) => {
      const matchSearch =
        !q ||
        inst.nom.toLowerCase().includes(q) ||
        inst.email_admin.toLowerCase().includes(q) ||
        inst.pays.toLowerCase().includes(q)
      const matchStatut =
        filterStatut === "all" ||
        (filterStatut === "actif" && inst.abonnement_statut === "actif") ||
        (filterStatut === "trial" && inst.abonnement_statut === "trial") ||
        (filterStatut === "inactif" && inst.abonnement_statut === "inactif")
      const matchPays = filterPays === "all" || inst.pays === filterPays
      return matchSearch && matchStatut && matchPays
    })
  }, [data, search, filterStatut, filterPays])

  const handleToggleStatut = async (id: string, current: string) => {
    // Trial → actif (upgrade), actif/inactif → toggle
    const next = current === "actif" ? "inactif" : "actif"
    const inst = data?.find((i) => i.id === id)
    setPendingId(id)
    try {
      await updateInstitutionStatut(id, next as "actif" | "inactif")
      mutate((prev) =>
        prev?.map((i) =>
          i.id === id
            ? {
                ...i,
                abonnement_statut: next,
                trial_end: null,
                dossiers_limit: null,
              }
            : i,
        ),
      )
      toast.success(
        next === "actif" ? "Institution activée" : "Institution désactivée",
        { description: inst?.nom },
      )
    } catch {
      toast.error("Erreur", {
        description: "Impossible de modifier le statut.",
      })
    } finally {
      setPendingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    const inst = data?.find((i) => i.id === id)
    setPendingId(id)
    try {
      await deleteAdminInstitution(id)
      mutate((prev) => prev?.filter((i) => i.id !== id))
      toast.success("Institution supprimée", { description: inst?.nom })
    } catch {
      toast.error("Erreur", {
        description: "Impossible de supprimer l'institution.",
      })
    } finally {
      setPendingId(null)
    }
  }

  return (
    <>
      {showCreate && (
        <CreateInstitutionDialog
          onClose={() => setShowCreate(false)}
          onCreated={(institution) => {
            mutate((prev) => [institution, ...(prev ?? [])])
            setShowCreate(false)
          }}
        />
      )}
      <div className="p-6 lg:p-8">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Institutions</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {data
                ? filtered.length < data.length
                  ? `${filtered.length} / ${data.length} institutions`
                  : `${data.length} institutions`
                : "…"}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
          >
            <Plus className="w-4 h-4" /> Créer
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Rechercher par nom, email, pays…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterStatut} onValueChange={setFilterStatut}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="actif">ACTIF</SelectItem>
              <SelectItem value="trial">TRIAL</SelectItem>
              <SelectItem value="inactif">INACTIF</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPays} onValueChange={setFilterPays}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Pays" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les pays</SelectItem>
              {PAYS.map((p) => (
                <SelectItem key={p} value={p}>
                  <span className="flex items-center gap-2">
                    {PAYS_ISO[p] && (
                      <ReactCountryFlag
                        countryCode={PAYS_ISO[p]}
                        svg
                        style={{ width: "1.1em", height: "1.1em" }}
                      />
                    )}
                    {p}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="px-5 py-3">Institution</TableHead>
                  <TableHead className="px-5 py-3">Email admin</TableHead>
                  <TableHead className="px-5 py-3">Pays</TableHead>
                  <TableHead className="px-5 py-3 text-center">
                    Statut
                  </TableHead>
                  <TableHead className="px-5 py-3 text-right">
                    Dossiers
                  </TableHead>
                  <TableHead className="px-5 py-3">Créée le</TableHead>
                  <TableHead className="px-5 py-3">Fin d&apos;essai</TableHead>
                  <TableHead className="px-5 py-3">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inst) => {
                  const isTrial = inst.abonnement_statut === "trial"
                  const isActif = inst.abonnement_statut === "actif"
                  const isPending = pendingId === inst.id

                  return (
                    <TableRow key={inst.id}>
                      <TableCell className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 shrink-0">
                            <Building2 className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">
                            {inst.nom}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-muted-foreground">
                        {inst.email_admin}
                      </TableCell>
                      <TableCell className="px-5 py-3.5">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          {PAYS_ISO[inst.pays] && (
                            <ReactCountryFlag
                              countryCode={PAYS_ISO[inst.pays]}
                              svg
                              style={{ width: "1.1em", height: "1.1em" }}
                            />
                          )}
                          {inst.pays}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-3.5">
                        <div className="flex items-center justify-center">
                          {isTrial ? (
                            <TrialBadge
                              trialEnd={inst.trial_end}
                              dossierLimit={inst.dossiers_limit}
                              nbDossiers={inst.nb_dossiers}
                            />
                          ) : (
                            <span className={cn(
                              "text-xs font-semibold px-2 py-0.5 rounded-full",
                              isActif
                                ? "bg-score-favorable-bg text-score-favorable"
                                : "bg-muted text-muted-foreground",
                            )}>
                              {isActif ? "ACTIF" : "INACTIF"}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-right tabular-nums text-foreground">
                        {isTrial && inst.dossiers_limit ? (
                          <span
                            className={cn(
                              "text-xs font-medium",
                              inst.nb_dossiers >= inst.dossiers_limit
                                ? "text-destructive"
                                : "text-foreground",
                            )}
                          >
                            {inst.nb_dossiers} / {inst.dossiers_limit}
                          </span>
                        ) : (
                          inst.nb_dossiers
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-muted-foreground">
                        {formatDate(inst.created_at)}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-muted-foreground">
                        {isTrial && inst.trial_end ? formatDate(inst.trial_end) : '—'}
                      </TableCell>
                      <TableCell className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-3">
                          {isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          ) : isTrial ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => handleToggleStatut(inst.id, inst.abonnement_statut)}
                                  className="p-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="left">Activer</TooltipContent>
                            </Tooltip>
                          ) : (
                            <Switch
                              checked={isActif}
                              onCheckedChange={() => handleToggleStatut(inst.id, inst.abonnement_statut)}
                              className={isActif ? "data-[state=checked]:bg-score-favorable" : ""}
                            />
                          )}
                          <AlertDialog>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                  <button
                                    disabled={isPending}
                                    className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent side="left">Supprimer</TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Supprimer l&apos;institution
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer{" "}
                                  <strong>{inst.nom}</strong> ? Cette action est
                                  irréversible et supprimera toutes les données
                                  associées.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(inst.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="px-5 py-10 text-center text-muted-foreground text-sm"
                    >
                      Aucune institution ne correspond à votre recherche.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </>
  )
}
