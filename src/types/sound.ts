export interface Sound {
  id: string;
  name: string;
  filename: string;
  duration: number;
  size: number;
  createdAt: string;
}

export interface SoundQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface SoundsResponse {
  sounds: Sound[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  maxSounds: number;
}

export interface UploadSoundResponse {
  sound: Sound;
}

export interface RenameSoundResponse {
  sound: Sound;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface ErrorResponse {
  error: ApiError;
}
