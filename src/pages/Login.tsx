import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SteamLoginButton } from "../components/SteamLoginButton";
import { useAuth } from "../hooks/useAuth";

export function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/soundboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-bg-main p-5">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-bg-main p-5">
      <div className="bg-bg-card rounded-lg p-10 text-center shadow-lg max-w-md w-full">
        <h1 className="text-text-primary text-2xl mb-2">SCP Soundboard Panel</h1>
        <p className="text-text-secondary text-sm mb-8">
          Sign in to access the soundboard
        </p>

        {error && (
          <div className="bg-error text-text-primary p-3 rounded mb-5 text-sm">
            Authentication failed. Please try again.
          </div>
        )}

        <SteamLoginButton />
      </div>
    </div>
  );
}
