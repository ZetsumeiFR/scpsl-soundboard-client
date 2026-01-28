import { useState, useRef, useCallback, useEffect, useSyncExternalStore } from "react";
import { useDropzone } from "react-dropzone";
import { useUploadSound } from "../hooks/useUploadSound";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 Mo
const ALLOWED_EXTENSIONS = [".mp3", ".wav", ".ogg"];
const NAME_MAX_LENGTH = 32;

function useCooldownTimer(cooldownEnd: number | null): number {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (!cooldownEnd) return () => {};
      const interval = setInterval(callback, 1000);
      return () => clearInterval(interval);
    },
    [cooldownEnd]
  );

  const getSnapshot = useCallback(() => {
    if (!cooldownEnd) return 0;
    const diff = Math.ceil((cooldownEnd - Date.now()) / 1000);
    return diff > 0 ? diff : 0;
  }, [cooldownEnd]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

interface UploadZoneProps {
  disabled?: boolean;
  maxSounds?: number;
}

export function UploadZone({ disabled, maxSounds }: UploadZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [soundName, setSoundName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { upload, progress, isPending, error, reset, cooldownEnd, clearCooldown } = useUploadSound();
  const cooldownRemaining = useCooldownTimer(cooldownEnd);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `Le fichier dépasse la taille maximale de 1 Mo`;
    }

    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Extension non supportée. Extensions acceptées : ${ALLOWED_EXTENSIONS.join(", ")}`;
    }

    return null;
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        return;
      }

      setValidationError(null);
      reset();

      setSelectedFile(file);
      setSoundName(file.name.replace(/\.[^/.]+$/, "").slice(0, NAME_MAX_LENGTH));

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    },
    [validateFile, previewUrl, reset]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/mpeg": [".mp3"],
      "audio/wav": [".wav"],
      "audio/ogg": [".ogg"],
    },
    maxFiles: 1,
    disabled: disabled || isPending || cooldownRemaining > 0,
  });

  const handleSubmit = () => {
    if (!selectedFile || !soundName.trim()) return;

    upload(
      { file: selectedFile, name: soundName.trim() },
      {
        onSuccess: () => {
          setSelectedFile(null);
          setSoundName("");
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }
        },
      }
    );
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setSoundName("");
    setValidationError(null);
    reset();
    clearCooldown();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // Clear cooldown when timer expires
  useEffect(() => {
    if (cooldownEnd && cooldownRemaining === 0) {
      clearCooldown();
    }
  }, [cooldownEnd, cooldownRemaining, clearCooldown]);

  const displayError = validationError || error?.message;

  return (
    <div className="bg-bg-card rounded-lg p-5">
      <h3 className="m-0 mb-4 text-base font-medium">Ajouter un son</h3>

      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-bg-dark hover:border-primary/50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          <div className="text-text-secondary">
            {disabled ? (
              <>
                <span className="text-3xl block mb-3">🚫</span>
                <p className="text-warning font-medium">
                  Limite de {maxSounds ?? 25} sons atteinte
                </p>
                <p className="text-xs text-text-muted mt-2">
                  Supprimez des sons existants pour en ajouter de nouveaux
                </p>
              </>
            ) : (
              <>
                <span className="text-3xl block mb-3">🎵</span>
                {isDragActive ? (
                  <p>Déposez le fichier ici...</p>
                ) : (
                  <>
                    <p>Glissez-déposez un fichier audio ici</p>
                    <p className="text-xs text-text-muted mt-2">
                      ou cliquez pour sélectionner (MP3, WAV, OGG - Max 1 Mo, 10s)
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center p-3 bg-bg-dark rounded-md">
            <span className="font-medium truncate">{selectedFile.name}</span>
            <span className="text-text-secondary text-sm">
              {(selectedFile.size / 1024).toFixed(1)} Ko
            </span>
          </div>

          {previewUrl && (
            <audio
              ref={audioRef}
              src={previewUrl}
              controls
              className="w-full h-10"
            />
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="sound-name" className="text-sm text-text-secondary">
              Nom du son
            </label>
            <input
              id="sound-name"
              type="text"
              value={soundName}
              onChange={(e) =>
                setSoundName(e.target.value.slice(0, NAME_MAX_LENGTH))
              }
              maxLength={NAME_MAX_LENGTH}
              placeholder="Nom du son"
              disabled={isPending}
              className="px-3 py-2.5 bg-bg-dark border border-bg-dark rounded-md text-text-primary text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
            />
            <span className="self-end text-xs text-text-muted">
              {soundName.length}/{NAME_MAX_LENGTH}
            </span>
          </div>

          {isPending && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-bg-dark rounded overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-text-secondary min-w-[40px] text-right">
                {progress}%
              </span>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="px-5 py-2.5 bg-transparent text-text-secondary border border-text-secondary rounded-md text-sm cursor-pointer transition-colors hover:bg-text-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending || !soundName.trim() || cooldownRemaining > 0}
              className="px-5 py-2.5 bg-primary text-text-primary border-none rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cooldownRemaining > 0
                ? `Patientez ${cooldownRemaining}s`
                : isPending
                  ? "Upload en cours..."
                  : "Uploader"}
            </button>
          </div>
        </div>
      )}

      {displayError && (
        <div className="mt-3 p-3 bg-error/10 border border-error rounded-md text-error text-sm">
          {displayError}
        </div>
      )}

      {cooldownRemaining > 0 && (
        <div className="mt-3 p-3 bg-warning/10 border border-warning rounded-md text-warning text-sm flex items-center gap-2">
          <span>⏳</span>
          <span>Prochain upload disponible dans {cooldownRemaining}s</span>
        </div>
      )}
    </div>
  );
}
