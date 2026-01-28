import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type { AdminUser } from "../../types/admin";

interface AdminUserActionsProps {
  user: AdminUser;
  currentUserId: string;
  onBan: () => void;
  onUnban: () => void;
  onDelete: () => void;
  onToggleAdmin: () => void;
}

export function AdminUserActions({
  user,
  currentUserId,
  onBan,
  onUnban,
  onDelete,
  onToggleAdmin,
}: AdminUserActionsProps) {
  const isSelf = user.id === currentUserId;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="p-2 rounded-md hover:bg-bg-dark text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Actions"
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
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[180px] bg-bg-card rounded-lg p-1 shadow-xl border border-bg-dark"
          sideOffset={5}
          align="end"
        >
          {!isSelf && (
            <>
              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer outline-none text-text-secondary hover:text-text-primary hover:bg-bg-dark transition-colors"
                onClick={onToggleAdmin}
              >
                {user.isAdmin ? (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    </svg>
                    Retirer admin
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    Promouvoir admin
                  </>
                )}
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-px bg-bg-dark my-1" />

              {user.isBanned ? (
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer outline-none text-success hover:bg-success/10 transition-colors"
                  onClick={onUnban}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Débannir
                </DropdownMenu.Item>
              ) : (
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer outline-none text-warning hover:bg-warning/10 transition-colors"
                  onClick={onBan}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                  Bannir
                </DropdownMenu.Item>
              )}

              <DropdownMenu.Separator className="h-px bg-bg-dark my-1" />

              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer outline-none text-error hover:bg-error/10 transition-colors"
                onClick={onDelete}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Supprimer
              </DropdownMenu.Item>
            </>
          )}

          {isSelf && (
            <div className="px-3 py-2 text-sm text-text-muted">
              Actions indisponibles sur votre propre compte
            </div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
