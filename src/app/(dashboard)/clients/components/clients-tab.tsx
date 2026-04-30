"use client";

import { useState } from "react";
import { Card } from "@/components/shared/ui/card";
import { DataPagination } from "@/components/shared/ui/data-pagination";
import { usePagination } from "@/lib/hooks/use-pagination";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { Button } from "@/components/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog";
import { Loader2, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useFetch } from "@/lib/hooks/use-fetch";
import { clientsApi } from "@/lib/api/clients";
import { ApiError, isApiConfigured } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { useT } from "@/lib/i18n";
import { ConfirmDeleteDialog } from "@/components/shared/ui/confirm-delete-dialog";
import { MOCK_CLIENTS } from "@/lib/api/mocks";
import type { Client } from "@/lib/api/types";

type Mode = "add" | "edit";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  notes: "",
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

const inputClass =
  "bg-secondary/50 border-transparent focus-visible:ring-primary focus-visible:bg-transparent";

const textareaClass =
  "flex w-full rounded-md border-transparent bg-secondary/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 resize-none min-h-[72px]";

export function ClientsTab() {
  const { businessId, user } = useAuth();
  const t = useT();
  const apiOn = isApiConfigured() && !!businessId;

  const { data, setData, isLoading } = useFetch<Client[]>(
    () => clientsApi.list(businessId!),
    { fallback: MOCK_CLIENTS, enabled: apiOn, cacheKey: businessId ?? "mock" },
  );

  const clients = data ?? MOCK_CLIENTS;

  const pg = usePagination(clients, 10);

  const [mode, setMode] = useState<Mode>("add");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  const field =
    (key: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setMode("add");
    setEditingId(null);
  };

  const openCreateForm = () => {
    resetForm();
    setFormOpen(true);
  };

  const closeForm = () => {
    if (submitting || loadingEdit) return;
    setFormOpen(false);
    resetForm();
  };

  const handleEdit = async (client: Client) => {
    if (!apiOn) {
      setForm({
        firstName: client.firstName ?? "",
        lastName: client.lastName ?? "",
        email: client.email,
        phone: client.phone ?? "",
        company: client.company ?? "",
        address: client.address ?? "",
        notes: client.notes ?? "",
      });
      setEditingId(client.id);
      setMode("edit");
      setFormOpen(true);
      return;
    }

    setLoadingEdit(true);
    setEditingId(client.id);
    try {
      const fresh = await clientsApi.getById(client.id, businessId!);
      setForm({
        firstName: fresh.firstName ?? "",
        lastName: fresh.lastName ?? "",
        email: fresh.email,
        phone: fresh.phone ?? "",
        company: fresh.company ?? "",
        address: fresh.address ?? "",
        notes: fresh.notes ?? "",
      });
      setMode("edit");
      setFormOpen(true);
    } catch {
      toast.error(t("clientsPage.loadError"));
      setEditingId(null);
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim()) {
      toast.error(t("clientsPage.firstNameRequired"));
      return;
    }
    if (!form.email.trim()) {
      toast.error(t("clientsPage.emailRequired"));
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "add") {
        const payload = {
          businessId: businessId!,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim() || undefined,
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          company: form.company.trim() || undefined,
          address: form.address.trim() || undefined,
        };

        const optimistic: Client = {
          id: `local-${Date.now()}`,
          fullName: [form.firstName, form.lastName].filter(Boolean).join(" ").trim(),
          ...payload,
        };

        if (apiOn) {
          const { id } = await clientsApi.create(payload);
          optimistic.id = id;
        }

        setData((prev) => [optimistic, ...(prev ?? [])]);
        toast.success(t("clientsPage.addSuccess"));
        resetForm();
        setFormOpen(false);
      } else {
        const payload = {
          businessId: businessId!,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim() || undefined,
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          company: form.company.trim() || undefined,
          address: form.address.trim() || undefined,
          notes: form.notes.trim() || undefined,
          updatedBy: user?.id,
        };

        if (apiOn) {
          await clientsApi.update(editingId!, payload);
        }

        const updatedName = [form.firstName, form.lastName].filter(Boolean).join(" ").trim();

        setData((prev) =>
          (prev ?? []).map((c) =>
            c.id === editingId ? { ...c, ...payload, fullName: updatedName } : c,
          ),
        );
        toast.success(t("clientsPage.updateSuccess"));
        resetForm();
        setFormOpen(false);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("clientsPage.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      if (apiOn) {
        await clientsApi.delete(deleteTarget.id, businessId!, user?.id ?? "");
      }
      setData((prev) => (prev ?? []).filter((c) => c.id !== deleteTarget.id));
      if (editingId === deleteTarget.id) resetForm();
      toast.success(t("clientsPage.deleteSuccess", { name: deleteTarget.fullName }));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("clientsPage.deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={!!deletingId}
      />
      {/* ── Form Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) closeForm(); else setFormOpen(true); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="pe-8">
              <DialogTitle className="text-[clamp(1.125rem,3vw,1.5rem)]">
                {mode === "add" ? t("clientsPage.form.addTitle") : t("clientsPage.form.editTitle")}
              </DialogTitle>
              <DialogDescription className="text-[clamp(0.8125rem,2vw,0.875rem)] mt-1">
                {mode === "add" ? t("clientsPage.form.addDesc") : t("clientsPage.form.editDesc")}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[clamp(0.8125rem,2vw,0.875rem)]">
                    {t("clientsPage.form.firstName")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder={t("clientsPage.form.firstNamePlaceholder")}
                    value={form.firstName}
                    onChange={field("firstName")}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[clamp(0.8125rem,2vw,0.875rem)]">
                    {t("clientsPage.form.lastName")}
                  </Label>
                  <Input
                    placeholder={t("clientsPage.form.lastNamePlaceholder")}
                    value={form.lastName}
                    onChange={field("lastName")}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[clamp(0.8125rem,2vw,0.875rem)]">
                  {t("clientsPage.form.email")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="email"
                  dir="ltr"
                  placeholder="client@example.com"
                  value={form.email}
                  onChange={field("email")}
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[clamp(0.8125rem,2vw,0.875rem)]">
                  {t("clientsPage.form.phone")}
                </Label>
                <Input
                  type="tel"
                  dir="ltr"
                  placeholder="+966 5x xxx xxxx"
                  value={form.phone}
                  onChange={field("phone")}
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[clamp(0.8125rem,2vw,0.875rem)]">
                  {t("clientsPage.form.company")}
                </Label>
                <Input
                  placeholder={t("clientsPage.form.companyPlaceholder")}
                  value={form.company}
                  onChange={field("company")}
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[clamp(0.8125rem,2vw,0.875rem)]">
                  {t("clientsPage.form.address")}
                </Label>
                <Input
                  placeholder={t("clientsPage.form.addressPlaceholder")}
                  value={form.address}
                  onChange={field("address")}
                  className={inputClass}
                />
              </div>

              {mode === "edit" && (
                <div className="space-y-2">
                  <Label className="text-[clamp(0.8125rem,2vw,0.875rem)]">
                    {t("clientsPage.form.notes")}
                  </Label>
                  <textarea
                    placeholder={t("clientsPage.form.notesPlaceholder")}
                    value={form.notes}
                    onChange={field("notes")}
                    className={textareaClass}
                  />
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeForm}
                  disabled={submitting || loadingEdit}
                >
                  {t("clientsPage.form.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || loadingEdit}
                  className="gap-2 font-bold"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : mode === "add" ? (
                    <Plus className="w-4 h-4" />
                  ) : (
                    <Pencil className="w-4 h-4" />
                  )}
                  {submitting
                    ? t("clientsPage.form.saving")
                    : mode === "add"
                      ? t("clientsPage.form.submit")
                      : t("clientsPage.form.save")}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Clients List ───────────────────────────────────────────────────── */}
      <Card className="shadow-sm border-border overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-border bg-card flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <UserRound className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-[clamp(0.875rem,2.5vw,1rem)]">
              {t("clientsPage.listTitle")}
            </h4>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground bg-secondary/60 px-2.5 py-0.5 rounded-full font-medium">
              {pg.total} {t("clientsPage.countSuffix")}
            </span>
            <Button size="sm" onClick={openCreateForm} className="h-9 gap-1.5 font-bold">
              <Plus className="w-4 h-4" />
              {t("clientsPage.addNew")}
            </Button>
          </div>
        </div>

        {clients.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <UserRound className="w-10 h-10 opacity-30" />
            <p className="text-sm">{t("clientsPage.noClients")}</p>
            <Button onClick={openCreateForm} size="sm" className="mt-2 gap-1.5">
              <Plus className="w-4 h-4" />
              {t("clientsPage.addFirst")}
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full text-right text-[clamp(0.8125rem,2vw,0.875rem)] min-w-[max(680px,100%)]">
              <thead className="bg-secondary/50 text-muted-foreground text-[clamp(0.75rem,1.5vw,0.875rem)]">
                <tr className="border-b border-border">
                  <th className="px-6 py-3 font-medium">{t("clientsPage.table.client")}</th>
                  <th className="px-6 py-3 font-medium">{t("clientsPage.table.email")}</th>
                  <th className="px-6 py-3 font-medium">{t("clientsPage.table.company")}</th>
                  <th className="px-6 py-3 font-medium">{t("clientsPage.table.phone")}</th>
                  <th className="px-6 py-3 font-medium text-center">{t("clientsPage.table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {pg.paged.map((client) => {
                  const isDeleting = deletingId === client.id;
                  const isEditing = editingId === client.id;

                  return (
                    <tr
                      key={client.id}
                      className={`transition-colors ${isEditing ? "bg-primary/5" : "hover:bg-secondary/30"}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 select-none">
                            {initials(client.fullName)}
                          </div>
                          <div>
                            <p className="font-medium leading-tight">{client.fullName}</p>
                            {client.address && (
                              <p className="text-[0.7rem] text-muted-foreground mt-0.5">{client.address}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-muted-foreground" dir="ltr">
                        <span className="text-right block">{client.email}</span>
                      </td>

                      <td className="px-6 py-4 text-muted-foreground">
                        {client.company ?? "—"}
                      </td>

                      <td className="px-6 py-4 text-muted-foreground font-mono text-[clamp(0.75rem,1.5vw,0.8125rem)]" dir="ltr">
                        {client.phone ?? "—"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            onClick={() => handleEdit(client)}
                            disabled={loadingEdit || !!deletingId}
                          >
                            {loadingEdit && isEditing
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Pencil className="w-3.5 h-3.5" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(client)}
                            disabled={isDeleting || submitting}
                          >
                            {isDeleting
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <DataPagination
          page={pg.page}
          totalPages={pg.totalPages}
          total={pg.total}
          from={pg.from}
          to={pg.to}
          pageSize={pg.pageSize}
          onPageChange={pg.goTo}
          onPageSizeChange={pg.changePageSize}
        />
      </Card>
    </div>
  );
}
