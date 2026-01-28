import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { type SortingState } from "@tanstack/react-table";
import { useAuth } from "../hooks/useAuth";
import { useAdminUsers, useBanUser, useDeleteUser, useToggleAdmin } from "../hooks/admin";
import { SearchInput } from "../components/SearchInput";
import { Pagination } from "../components/Pagination";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { AdminUsersTable } from "../components/admin/AdminUsersTable";
import { AdminFilterTabs } from "../components/admin/AdminFilterTabs";
import { SettingsForm } from "../components/admin/SettingsForm";
import type { AdminUser, AdminUsersQueryParams } from "../types/admin";

type AdminTab = "users" | "settings";

type DialogType = "ban" | "unban" | "delete" | "toggleAdmin" | null;

export function AdminPanel() {
  const { user } = useAuth();

  // Main tab state
  const [activeTab, setActiveTab] = useState<AdminTab>("users");

  // Query params state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "admins" | "banned">("all");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  // Dialog state
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Convert sorting state to query params
  const queryParams = useMemo<AdminUsersQueryParams>(() => {
    const params: AdminUsersQueryParams = {
      page,
      limit: 20,
      filter,
    };

    if (search) {
      params.search = search;
    }

    if (sorting.length > 0) {
      const sort = sorting[0];
      params.sortBy = sort.id as "username" | "createdAt" | "soundCount";
      params.sortOrder = sort.desc ? "desc" : "asc";
    }

    return params;
  }, [page, search, filter, sorting]);

  // Queries and mutations
  const { data, isLoading, isFetching } = useAdminUsers(queryParams);
  const banUser = useBanUser();
  const deleteUser = useDeleteUser();
  const toggleAdmin = useToggleAdmin();

  // Handle search with debounce reset
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  // Handle filter change
  const handleFilterChange = (value: "all" | "admins" | "banned") => {
    setFilter(value);
    setPage(1);
  };

  // Handle sorting change
  const handleSortingChange = (newSorting: SortingState) => {
    setSorting(newSorting);
    setPage(1);
  };

  // Dialog handlers
  const openDialog = (type: DialogType, targetUser: AdminUser) => {
    setDialogType(type);
    setSelectedUser(targetUser);
  };

  const closeDialog = () => {
    setDialogType(null);
    setSelectedUser(null);
  };

  const handleConfirm = async () => {
    if (!selectedUser) return;

    try {
      switch (dialogType) {
        case "ban":
          await banUser.mutateAsync({ userId: selectedUser.id, isBanned: true });
          break;
        case "unban":
          await banUser.mutateAsync({ userId: selectedUser.id, isBanned: false });
          break;
        case "delete":
          await deleteUser.mutateAsync(selectedUser.id);
          break;
        case "toggleAdmin":
          await toggleAdmin.mutateAsync({
            userId: selectedUser.id,
            isAdmin: !selectedUser.isAdmin,
          });
          break;
      }
      closeDialog();
    } catch {
      // Error handling is done by the mutations
    }
  };

  const getDialogConfig = () => {
    if (!selectedUser) return { title: "", description: "" };

    switch (dialogType) {
      case "ban":
        return {
          title: "Bannir l'utilisateur",
          description: `Êtes-vous sûr de vouloir bannir ${selectedUser.username} ? L'utilisateur ne pourra plus accéder à la plateforme.`,
          confirmLabel: "Bannir",
          variant: "danger" as const,
        };
      case "unban":
        return {
          title: "Débannir l'utilisateur",
          description: `Êtes-vous sûr de vouloir débannir ${selectedUser.username} ? L'utilisateur pourra à nouveau accéder à la plateforme.`,
          confirmLabel: "Débannir",
          variant: "default" as const,
        };
      case "delete":
        return {
          title: "Supprimer l'utilisateur",
          description: `Êtes-vous sûr de vouloir supprimer ${selectedUser.username} ? Cette action supprimera également tous ses sons (${selectedUser.soundCount}) et est irréversible.`,
          confirmLabel: "Supprimer",
          variant: "danger" as const,
        };
      case "toggleAdmin":
        return {
          title: selectedUser.isAdmin ? "Retirer les droits admin" : "Promouvoir admin",
          description: selectedUser.isAdmin
            ? `Êtes-vous sûr de vouloir retirer les droits admin de ${selectedUser.username} ?`
            : `Êtes-vous sûr de vouloir promouvoir ${selectedUser.username} en tant qu'administrateur ?`,
          confirmLabel: selectedUser.isAdmin ? "Retirer" : "Promouvoir",
          variant: selectedUser.isAdmin ? "danger" as const : "default" as const,
        };
      default:
        return { title: "", description: "" };
    }
  };

  const dialogConfig = getDialogConfig();
  const isDialogLoading =
    banUser.isPending || deleteUser.isPending || toggleAdmin.isPending;

  return (
    <div className="min-h-screen bg-bg-main text-text-primary">
      <header className="flex justify-between items-center px-6 py-4 bg-bg-card border-b border-bg-dark">
        <div className="flex items-center gap-4">
          <Link
            to="/soundboard"
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Retour
          </Link>
          <h1 className="text-xl m-0">Administration</h1>
        </div>

        <div className="flex items-center gap-3">
          {user?.avatarUrl && (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm text-text-secondary">{user?.username}</span>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        {/* Main Tabs */}
        <div className="flex gap-1 bg-bg-dark rounded-lg p-1 mb-6 w-fit">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "users"
                ? "bg-primary text-text-primary"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-card"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Utilisateurs
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "settings"
                ? "bg-primary text-text-primary"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-card"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Parametres
          </button>
        </div>

        {activeTab === "users" ? (
          <div className="flex flex-col gap-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <AdminFilterTabs value={filter} onChange={handleFilterChange} />
              <div className="w-full sm:w-80">
                <SearchInput
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Rechercher par nom ou Steam ID..."
                  isLoading={isFetching && !isLoading}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="text-sm text-text-muted">
              {data ? (
                <>
                  {data.count} utilisateur{data.count > 1 ? "s" : ""} trouve
                  {data.count > 1 ? "s" : ""}
                </>
              ) : null}
            </div>

            {/* Table */}
            <AdminUsersTable
              users={data?.users ?? []}
              currentUserId={user?.id ?? ""}
              sorting={sorting}
              onSortingChange={handleSortingChange}
              onBan={(u) => openDialog("ban", u)}
              onUnban={(u) => openDialog("unban", u)}
              onDelete={(u) => openDialog("delete", u)}
              onToggleAdmin={(u) => openDialog("toggleAdmin", u)}
              isLoading={isLoading}
            />

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <Pagination
                currentPage={data.page}
                totalPages={data.totalPages}
                onPageChange={setPage}
                isLoading={isFetching}
              />
            )}
          </div>
        ) : (
          <SettingsForm />
        )}
      </main>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={dialogType !== null}
        onOpenChange={(open) => !open && closeDialog()}
        title={dialogConfig.title}
        description={dialogConfig.description}
        confirmLabel={dialogConfig.confirmLabel}
        variant={dialogConfig.variant}
        onConfirm={handleConfirm}
        isLoading={isDialogLoading}
      />
    </div>
  );
}
