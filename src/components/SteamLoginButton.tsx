import { api } from "../api/client";

export function SteamLoginButton() {
  const handleLogin = () => {
    window.location.href = api.getSteamLoginUrl();
  };

  return (
    <button
      onClick={handleLogin}
      className="inline-flex items-center gap-2 px-6 py-3 bg-steam text-text-primary border-none rounded text-base font-medium cursor-pointer transition-colors hover:bg-steam-hover"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2C6.48 2 2 6.05 2 11.14c0 4.01 2.73 7.41 6.5 8.68l3.24-1.38c.3-.13.64.07.64.39v.94c0 .22.18.4.4.4h.44c.22 0 .4-.18.4-.4v-.94c0-.32.34-.52.64-.39l3.24 1.38C21.27 18.55 24 15.15 24 11.14 24 6.05 19.52 2 14 2h-2zm-1.5 14.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm5 0a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
      </svg>
      Sign in with Steam
    </button>
  );
}
