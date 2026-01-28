import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../api/client";
import { useRenameSound } from "../hooks/useRenameSound";
import type { Sound } from "../types/sound";

const nameSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom doit contenir au moins 1 caractère")
    .max(32, "Le nom ne peut pas dépasser 32 caractères")
    .transform((v) => v.trim()),
});

type NameFormData = z.infer<typeof nameSchema>;

interface SoundCardProps {
  sound: Sound;
  onDelete: (sound: Sound) => void;
  variant?: "list" | "grid";
}

export function SoundCard({
  sound,
  onDelete,
  variant = "list",
}: SoundCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { rename, isPending, error: renameError, reset: resetRename } = useRenameSound();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setFocus,
  } = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: sound.name },
  });

  // Reset form when sound changes
  useEffect(() => {
    reset({ name: sound.name });
  }, [sound.name, reset]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing) {
      // Small delay to ensure the input is rendered
      setTimeout(() => {
        setFocus("name");
        inputRef.current?.select();
      }, 0);
    }
  }, [isEditing, setFocus]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleDelete = () => {
    onDelete(sound);
  };

  const startEditing = () => {
    resetRename();
    reset({ name: sound.name });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    reset({ name: sound.name });
    resetRename();
    setIsEditing(false);
  };

  const onSubmit = (data: NameFormData) => {
    // Don't submit if name hasn't changed
    if (data.name === sound.name) {
      setIsEditing(false);
      return;
    }

    rename(
      { id: sound.id, name: data.name },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      cancelEditing();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`;
    return `${(bytes / 1024).toFixed(1)} Ko`;
  };

  const errorMessage = errors.name?.message || renameError?.message;
  const errorId = `name-error-${sound.id}`;

  if (variant === "grid") {
    return (
      <div className="flex flex-col items-center gap-3 p-4 bg-bg-dark rounded-lg group">
        <audio
          ref={audioRef}
          src={api.getSoundStreamUrl(sound.id)}
          onEnded={handleAudioEnded}
          preload="none"
        />

        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Arrêter" : "Lire"}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-colors ${
            isPlaying
              ? "bg-error text-text-primary"
              : "bg-primary text-text-primary hover:bg-primary-hover"
          }`}
        >
          {isPlaying ? "⏹" : "▶"}
        </button>

        <div className="text-center min-w-0 w-full">
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
              <div className="flex flex-col gap-1">
                <input
                  {...register("name")}
                  ref={(e) => {
                    register("name").ref(e);
                    inputRef.current = e;
                  }}
                  type="text"
                  disabled={isPending}
                  onKeyDown={handleKeyDown}
                  aria-label="Nom du son"
                  aria-invalid={!!errorMessage}
                  aria-describedby={errorMessage ? errorId : undefined}
                  className={`w-full px-2 py-1 text-sm rounded border bg-bg-primary text-text-primary text-center ${
                    errorMessage
                      ? "border-error focus:ring-error"
                      : "border-border-primary focus:ring-primary"
                  } focus:outline-none focus:ring-1`}
                />
                {errorMessage && (
                  <span id={errorId} className="text-xs text-error">
                    {errorMessage}
                  </span>
                )}
                <div className="flex justify-center gap-1 mt-1">
                  <button
                    type="submit"
                    disabled={isPending}
                    aria-label="Enregistrer"
                    className="w-7 h-7 rounded flex items-center justify-center text-xs bg-primary text-text-primary hover:bg-primary-hover disabled:opacity-50"
                  >
                    {isPending ? "…" : "✓"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={isPending}
                    aria-label="Annuler"
                    className="w-7 h-7 rounded flex items-center justify-center text-xs bg-transparent text-text-secondary border border-border-primary hover:bg-bg-primary disabled:opacity-50"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-center justify-center gap-1">
                <span className="font-medium truncate" title={sound.name}>
                  {sound.name}
                </span>
                <button
                  onClick={startEditing}
                  aria-label="Modifier le nom"
                  className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center text-xs text-text-secondary hover:text-text-primary hover:bg-bg-primary transition-opacity"
                >
                  ✏️
                </button>
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {formatDuration(sound.duration)}
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleDelete}
          aria-label="Supprimer"
          className="w-8 h-8 rounded-md flex items-center justify-center text-sm bg-transparent text-error border border-error hover:bg-error/10"
        >
          🗑
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-bg-dark rounded-md group">
      <audio
        ref={audioRef}
        src={api.getSoundStreamUrl(sound.id)}
        onEnded={handleAudioEnded}
        preload="none"
      />

      <button
        onClick={togglePlay}
        aria-label={isPlaying ? "Arrêter" : "Lire"}
        className={`w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0 transition-colors ${
          isPlaying
            ? "bg-error text-text-primary"
            : "bg-primary text-text-primary hover:bg-primary-hover"
        }`}
      >
        {isPlaying ? "⏹" : "▶"}
      </button>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <input
                  {...register("name")}
                  ref={(e) => {
                    register("name").ref(e);
                    inputRef.current = e;
                  }}
                  type="text"
                  disabled={isPending}
                  onKeyDown={handleKeyDown}
                  aria-label="Nom du son"
                  aria-invalid={!!errorMessage}
                  aria-describedby={errorMessage ? errorId : undefined}
                  className={`w-full px-2 py-1 text-sm rounded border bg-bg-primary text-text-primary ${
                    errorMessage
                      ? "border-error focus:ring-error"
                      : "border-border-primary focus:ring-primary"
                  } focus:outline-none focus:ring-1`}
                />
                {errorMessage && (
                  <span id={errorId} className="text-xs text-error mt-1 block">
                    {errorMessage}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={isPending}
                aria-label="Enregistrer"
                className="w-7 h-7 rounded flex items-center justify-center text-xs bg-primary text-text-primary hover:bg-primary-hover disabled:opacity-50 shrink-0"
              >
                {isPending ? "…" : "✓"}
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={isPending}
                aria-label="Annuler"
                className="w-7 h-7 rounded flex items-center justify-center text-xs bg-transparent text-text-secondary border border-border-primary hover:bg-bg-primary disabled:opacity-50 shrink-0"
              >
                ✕
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-center gap-1 mb-1">
              <span className="font-medium truncate">{sound.name}</span>
              <button
                onClick={startEditing}
                aria-label="Modifier le nom"
                className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center text-xs text-text-secondary hover:text-text-primary hover:bg-bg-primary transition-opacity shrink-0"
              >
                ✏️
              </button>
            </div>
            <div className="flex gap-2 text-xs text-text-secondary">
              <span>{formatDuration(sound.duration)}</span>
              <span>•</span>
              <span>{formatSize(sound.size)}</span>
              <span>•</span>
              <span>{formatDate(sound.createdAt)}</span>
            </div>
          </>
        )}
      </div>

      <button
        onClick={handleDelete}
        aria-label="Supprimer"
        className="w-8 h-8 rounded-md flex items-center justify-center text-sm bg-transparent text-error border border-error hover:bg-error/10 shrink-0"
      >
        🗑
      </button>
    </div>
  );
}
