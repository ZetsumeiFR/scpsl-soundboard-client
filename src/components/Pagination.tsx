interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="px-3 py-2 rounded-md text-sm font-medium transition-colors bg-bg-dark text-text-secondary hover:bg-primary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-bg-dark disabled:hover:text-text-secondary"
      >
        Précédent
      </button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-3 py-2 text-text-muted"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={isLoading}
              className={`min-w-[40px] px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                page === currentPage
                  ? "bg-primary text-text-primary"
                  : "bg-bg-dark text-text-secondary hover:bg-primary/20"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="px-3 py-2 rounded-md text-sm font-medium transition-colors bg-bg-dark text-text-secondary hover:bg-primary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-bg-dark disabled:hover:text-text-secondary"
      >
        Suivant
      </button>
    </nav>
  );
}
