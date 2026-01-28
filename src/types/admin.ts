export interface AdminUser {
  id: string;
  steamId64: string;
  username: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: string;
  soundCount: number;
}

export interface AdminUsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "username" | "createdAt" | "soundCount";
  sortOrder?: "asc" | "desc";
  filter?: "all" | "admins" | "banned";
}

export interface AdminUsersResponse {
  users: AdminUser[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUserResponse {
  user: AdminUser;
}

export interface DeleteUserResponse {
  success: boolean;
  deletedSoundsCount: number;
}

export interface Settings {
  maxSoundsPerUser: number;
  maxFileSize: number;
  maxDuration: number;
  cooldownSeconds: number;
  allowedFormats: string[];
}

export interface SettingsResponse {
  settings: Settings;
}
