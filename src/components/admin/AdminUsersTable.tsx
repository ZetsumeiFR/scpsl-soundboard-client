import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import type { AdminUser } from "../../types/admin";
import { AdminUserActions } from "./AdminUserActions";

interface AdminUsersTableProps {
  users: AdminUser[];
  currentUserId: string;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  onBan: (user: AdminUser) => void;
  onUnban: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onToggleAdmin: (user: AdminUser) => void;
  isLoading?: boolean;
}

export function AdminUsersTable({
  users,
  currentUserId,
  sorting,
  onSortingChange,
  onBan,
  onUnban,
  onDelete,
  onToggleAdmin,
  isLoading,
}: AdminUsersTableProps) {
  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: "username",
      header: ({ column }) => (
        <SortableHeader
          label="Utilisateur"
          sorted={column.getIsSorted()}
          onClick={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.avatarUrl ? (
            <img
              src={row.original.avatarUrl}
              alt={row.original.username}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-bg-dark flex items-center justify-center">
              <span className="text-text-muted text-sm">
                {row.original.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-text-primary font-medium">
              {row.original.username}
            </span>
            <span className="text-text-muted text-xs">
              {row.original.steamId64}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "soundCount",
      header: ({ column }) => (
        <SortableHeader
          label="Sons"
          sorted={column.getIsSorted()}
          onClick={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => (
        <span className="text-text-secondary">{row.original.soundCount}</span>
      ),
    },
    {
      id: "status",
      header: "Statut",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.isAdmin && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
              Admin
            </span>
          )}
          {row.original.isBanned && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-error/20 text-error">
              Banni
            </span>
          )}
          {!row.original.isAdmin && !row.original.isBanned && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-bg-dark text-text-muted">
              Membre
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <SortableHeader
          label="Inscription"
          sorted={column.getIsSorted()}
          onClick={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => (
        <span className="text-text-secondary text-sm">
          {new Date(row.original.createdAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <AdminUserActions
          user={row.original}
          currentUserId={currentUserId}
          onBan={() => onBan(row.original)}
          onUnban={() => onUnban(row.original)}
          onDelete={() => onDelete(row.original)}
          onToggleAdmin={() => onToggleAdmin(row.original)}
        />
      ),
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    state: { sorting },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === "function" ? updater(sorting) : updater;
      onSortingChange(newSorting);
    },
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-bg-dark">
      <table className="w-full">
        <thead className="bg-bg-dark">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-sm font-medium text-text-secondary"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-bg-dark">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center">
                <div className="flex justify-center">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-text-muted"
              >
                Aucun utilisateur trouvé
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="bg-bg-card hover:bg-bg-dark/50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

interface SortableHeaderProps {
  label: string;
  sorted: false | "asc" | "desc";
  onClick: () => void;
}

function SortableHeader({ label, sorted, onClick }: SortableHeaderProps) {
  return (
    <button
      className="flex items-center gap-1 hover:text-text-primary transition-colors"
      onClick={onClick}
    >
      {label}
      <span className="flex flex-col">
        <svg
          className={`w-3 h-3 ${sorted === "asc" ? "text-primary" : "text-text-muted"}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 8l-6 6h12z" />
        </svg>
        <svg
          className={`w-3 h-3 -mt-1 ${sorted === "desc" ? "text-primary" : "text-text-muted"}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 16l6-6H6z" />
        </svg>
      </span>
    </button>
  );
}
