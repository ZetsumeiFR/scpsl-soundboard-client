import { useState, useMemo } from "react";
import { useUserSounds } from "../hooks/useUserSounds";
import { useDeleteSound } from "../hooks/useDeleteSound";
import { useDebounce } from "../hooks/useDebounce";
import { useViewPreference } from "../hooks/useViewPreference";
import { SoundCard } from "./SoundCard";
import { Pagination } from "./Pagination";
import { ViewToggle } from "./ViewToggle";
import { SearchInput } from "./SearchInput";
import { ConfirmDialog } from "./ConfirmDialog";
import { QuotaBar } from "./QuotaBar";
import type { Sound } from "../types/sound";

const ITEMS_PER_PAGE = 20;

export function SoundLibrary() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const { viewMode, setViewMode } = useViewPreference();

  const searchQuery = useMemo(
    () => (debouncedSearch.trim() ? debouncedSearch.trim() : undefined),
    [debouncedSearch]
  );

  const {
    sounds,
    count,
    totalCount,
    totalPages,
    maxSounds,
    isLoading,
    isFetching,
  } = useUserSounds({
    page,
    limit: ITEMS_PER_PAGE,
    search: searchQuery,
  });

  const { deleteSound, isPending: isDeleting } = useDeleteSound();
  const [soundToDelete, setSoundToDelete] = useState<Sound | null>(null);

  const handleDeleteRequest = (sound: Sound) => {
    setSoundToDelete(sound);
  };

  const handleConfirmDelete = () => {
    if (soundToDelete) {
      deleteSound(soundToDelete.id, {
        onSettled: () => {
          setSoundToDelete(null);
          // If deleting the last item on a page > 1, go to previous page
          if (sounds.length === 1 && page > 1) {
            setPage(page - 1);
          }
        },
      });
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1); // Reset to first page on search
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="bg-bg-card rounded-lg p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-medium m-0">Mes sons</h3>
        </div>
        <div className="text-center py-10 text-text-secondary">
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-card rounded-lg p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-medium m-0">Mes sons</h3>
          <QuotaBar current={totalCount} max={maxSounds} />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <SearchInput
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Rechercher un son..."
            isLoading={isFetching && !isLoading}
          />
          <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
        </div>
      </div>

      {/* Search results info */}
      {searchQuery && (
        <div className="mb-4 text-sm text-text-secondary">
          {count === 0
            ? `Aucun résultat pour "${searchQuery}"`
            : `${count} résultat${count > 1 ? "s" : ""} pour "${searchQuery}"`}
        </div>
      )}

      {/* Sound list */}
      {sounds.length === 0 ? (
        <div className="text-center py-10 px-5 text-text-secondary">
          <span className="text-3xl block mb-3">🔇</span>
          {searchQuery ? (
            <p>Aucun son ne correspond à votre recherche</p>
          ) : (
            <>
              <p>Vous n'avez pas encore de sons</p>
              <p className="text-xs text-text-muted mt-2">
                Utilisez la zone ci-dessus pour ajouter votre premier son
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                : "flex flex-col gap-2"
            }
          >
            {sounds.map((sound) => (
              <SoundCard
                key={sound.id}
                sound={sound}
                variant={viewMode}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={isFetching}
              />
            </div>
          )}
        </>
      )}

      {/* Delete confirmation modal */}
      <ConfirmDialog
        open={soundToDelete !== null}
        onOpenChange={(open) => !open && setSoundToDelete(null)}
        title="Supprimer ce son ?"
        description={`"${soundToDelete?.name ?? ""}" sera définitivement supprimé.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
