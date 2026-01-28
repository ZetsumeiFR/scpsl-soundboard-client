import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLogout } from "../hooks/useLogout";
import { useUserSounds } from "../hooks/useUserSounds";
import { UploadZone } from "../components/UploadZone";
import { SoundLibrary } from "../components/SoundLibrary";

export function Soundboard() {
  const { user } = useAuth();
  const logout = useLogout();
  const { totalCount, maxSounds } = useUserSounds();

  const isQuotaReached = totalCount >= maxSounds;

  return (
    <div className="min-h-screen bg-bg-main text-text-primary">
      <header className="flex justify-between items-center px-6 py-4 bg-bg-card border-b border-bg-dark">
        <h1 className="text-xl m-0">SCP Soundboard Panel</h1>

        <div className="flex items-center gap-3">
          {user?.isAdmin && (
            <Link
              to="/admin"
              className="px-4 py-2 bg-primary/10 text-primary border border-primary/30 rounded transition-colors hover:bg-primary/20 text-sm"
            >
              Administration
            </Link>
          )}
          {user?.avatarUrl && (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm text-text-secondary">{user?.username}</span>
          <button
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="px-4 py-2 bg-transparent text-error border border-error rounded transition-colors hover:bg-error/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {logout.isPending ? "Déconnexion..." : "Déconnexion"}
          </button>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        <div className="flex flex-col gap-6">
          <UploadZone disabled={isQuotaReached} maxSounds={maxSounds} />
          <SoundLibrary />
        </div>
      </main>
    </div>
  );
}
