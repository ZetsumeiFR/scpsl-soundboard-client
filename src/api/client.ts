import type {
  Sound,
  SoundQueryParams,
  SoundsResponse,
  UploadSoundResponse,
  RenameSoundResponse,
  ErrorResponse,
} from "../types/sound";
import type {
  AdminUsersQueryParams,
  AdminUsersResponse,
  AdminUserResponse,
  DeleteUserResponse,
  SettingsResponse,
  Settings,
} from "../types/admin";

const API_URL = import.meta.env.VITE_API_URL;

export interface User {
  id: string;
  steamId64: string;
  username: string;
  avatarUrl: string | null;
  isAdmin: boolean;
}

export interface AuthResponse {
  user: User | null;
}

export class ApiError extends Error {
  code: string;
  retryAfter?: number;

  constructor(code: string, message: string, retryAfter?: number) {
    super(message);
    this.code = code;
    this.retryAfter = retryAfter;
    this.name = "ApiError";
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    // Try to parse error response
    try {
      const errorData = (await response.json()) as ErrorResponse;
      if (errorData.error) {
        throw new ApiError(errorData.error.code, errorData.error.message);
      }
    } catch (e) {
      if (e instanceof ApiError) throw e;
    }
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchApiFormData<T>(
  endpoint: string,
  formData: FormData,
  onProgress?: (progress: number) => void
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  // Use XMLHttpRequest for progress tracking
  if (onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText) as ErrorResponse;
            if (errorData.error) {
              const retryAfterHeader = xhr.getResponseHeader("Retry-After");
              const retryAfter = retryAfterHeader
                ? parseInt(retryAfterHeader, 10)
                : undefined;
              reject(
                new ApiError(errorData.error.code, errorData.error.message, retryAfter)
              );
              return;
            }
          } catch {
            // Ignore parse error
          }
          reject(new Error(`API Error: ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error"));
      });

      xhr.open("POST", url);
      xhr.withCredentials = true;
      xhr.send(formData);
    });
  }

  // Use fetch without progress tracking
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    try {
      const errorData = (await response.json()) as ErrorResponse;
      if (errorData.error) {
        const retryAfterHeader = response.headers.get("Retry-After");
        const retryAfter = retryAfterHeader
          ? parseInt(retryAfterHeader, 10)
          : undefined;
        throw new ApiError(errorData.error.code, errorData.error.message, retryAfter);
      }
    } catch (e) {
      if (e instanceof ApiError) throw e;
    }
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Auth
  getMe: () => fetchApi<AuthResponse>("/auth/me"),

  logout: () =>
    fetchApi<{ success: boolean }>("/auth/logout", {
      method: "POST",
    }),

  getSteamLoginUrl: () => `${API_URL}/auth/steam`,

  // Sounds
  getSounds: (params?: SoundQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("q", params.search);
    const query = searchParams.toString();
    return fetchApi<SoundsResponse>(`/sounds${query ? `?${query}` : ""}`);
  },

  uploadSound: (
    file: File,
    name: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadSoundResponse> => {
    const formData = new FormData();
    formData.append("audio", file);
    formData.append("name", name);
    return fetchApiFormData<UploadSoundResponse>("/sounds", formData, onProgress);
  },

  deleteSound: (id: string) =>
    fetchApi<{ success: boolean }>(`/sounds/${id}`, {
      method: "DELETE",
    }),

  renameSound: (id: string, name: string) =>
    fetchApi<RenameSoundResponse>(`/sounds/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }),

  getSoundStreamUrl: (id: string) => `${API_URL}/sounds/${id}/stream`,

  // Admin
  admin: {
    getUsers: (params?: AdminUsersQueryParams) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.limit) searchParams.set("limit", params.limit.toString());
      if (params?.search) searchParams.set("q", params.search);
      if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
      if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);
      if (params?.filter) searchParams.set("filter", params.filter);
      const query = searchParams.toString();
      return fetchApi<AdminUsersResponse>(`/admin/users${query ? `?${query}` : ""}`);
    },

    getUser: (id: string) => fetchApi<AdminUserResponse>(`/admin/users/${id}`),

    updateUser: (id: string, data: { isAdmin?: boolean; isBanned?: boolean }) =>
      fetchApi<AdminUserResponse>(`/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    deleteUser: (id: string) =>
      fetchApi<DeleteUserResponse>(`/admin/users/${id}`, {
        method: "DELETE",
      }),

    deleteSound: (id: string) =>
      fetchApi<{ success: boolean }>(`/admin/sounds/${id}`, {
        method: "DELETE",
      }),

    getSettings: () => fetchApi<SettingsResponse>("/admin/settings"),

    updateSettings: (data: Partial<Settings>) =>
      fetchApi<SettingsResponse>("/admin/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },
};

export type { Sound, SoundsResponse };
