import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useSettings, useUpdateSettings } from "../../hooks/admin";
import { settingsSchema, type Settings } from "../../schemas/settings";

const AVAILABLE_FORMATS = [
  { value: "audio/ogg", label: "OGG" },
  { value: "audio/mpeg", label: "MP3" },
  { value: "audio/wav", label: "WAV" },
];

export function SettingsForm() {
  const { data, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<Settings>({
    resolver: zodResolver(settingsSchema),
    values: data?.settings,
  });

  const watchedFormats = watch("allowedFormats") ?? [];

  const onSubmit = async (formData: Settings) => {
    try {
      await updateSettings.mutateAsync(formData);
      toast.success("Parametres mis a jour avec succes");
    } catch {
      toast.error("Erreur lors de la mise a jour des parametres");
    }
  };

  const toggleFormat = (format: string) => {
    const current = watchedFormats;
    if (current.includes(format)) {
      if (current.length > 1) {
        setValue(
          "allowedFormats",
          current.filter((f) => f !== format),
          { shouldDirty: true }
        );
      }
    } else {
      setValue("allowedFormats", [...current, format], { shouldDirty: true });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-bg-card rounded-lg p-6 border border-bg-dark">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-bg-dark rounded w-1/3"></div>
          <div className="h-10 bg-bg-dark rounded"></div>
          <div className="h-10 bg-bg-dark rounded"></div>
          <div className="h-10 bg-bg-dark rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-bg-card rounded-lg p-6 border border-bg-dark space-y-6"
    >
      <h2 className="text-lg font-semibold text-text-primary">
        Parametres systeme
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Max Sounds Per User */}
        <div className="space-y-2">
          <label
            htmlFor="maxSoundsPerUser"
            className="block text-sm font-medium text-text-secondary"
          >
            Limite de sons par joueur
          </label>
          <input
            id="maxSoundsPerUser"
            type="number"
            {...register("maxSoundsPerUser", { valueAsNumber: true })}
            className="w-full px-3 py-2 bg-bg-dark border border-bg-dark rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.maxSoundsPerUser && (
            <p className="text-sm text-red-400">
              {errors.maxSoundsPerUser.message}
            </p>
          )}
        </div>

        {/* Max File Size */}
        <div className="space-y-2">
          <label
            htmlFor="maxFileSize"
            className="block text-sm font-medium text-text-secondary"
          >
            Taille max par fichier (Mo)
          </label>
          <input
            id="maxFileSize"
            type="number"
            step="0.1"
            {...register("maxFileSize", {
              setValueAs: (v) => Math.round(parseFloat(v) * 1024 * 1024),
            })}
            value={
              data?.settings?.maxFileSize
                ? (data.settings.maxFileSize / 1024 / 1024).toFixed(1)
                : ""
            }
            onChange={(e) => {
              const mb = parseFloat(e.target.value);
              if (!isNaN(mb)) {
                setValue("maxFileSize", Math.round(mb * 1024 * 1024), {
                  shouldDirty: true,
                });
              }
            }}
            className="w-full px-3 py-2 bg-bg-dark border border-bg-dark rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.maxFileSize && (
            <p className="text-sm text-red-400">{errors.maxFileSize.message}</p>
          )}
        </div>

        {/* Max Duration */}
        <div className="space-y-2">
          <label
            htmlFor="maxDuration"
            className="block text-sm font-medium text-text-secondary"
          >
            Duree max par son (secondes)
          </label>
          <input
            id="maxDuration"
            type="number"
            {...register("maxDuration", { valueAsNumber: true })}
            className="w-full px-3 py-2 bg-bg-dark border border-bg-dark rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.maxDuration && (
            <p className="text-sm text-red-400">{errors.maxDuration.message}</p>
          )}
        </div>

        {/* Cooldown */}
        <div className="space-y-2">
          <label
            htmlFor="cooldownSeconds"
            className="block text-sm font-medium text-text-secondary"
          >
            Cooldown entre sons (secondes)
          </label>
          <input
            id="cooldownSeconds"
            type="number"
            {...register("cooldownSeconds", { valueAsNumber: true })}
            className="w-full px-3 py-2 bg-bg-dark border border-bg-dark rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.cooldownSeconds && (
            <p className="text-sm text-red-400">
              {errors.cooldownSeconds.message}
            </p>
          )}
        </div>
      </div>

      {/* Allowed Formats */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-secondary">
          Formats acceptes
        </label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_FORMATS.map((format) => (
            <button
              key={format.value}
              type="button"
              onClick={() => toggleFormat(format.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                watchedFormats.includes(format.value)
                  ? "bg-primary text-text-primary"
                  : "bg-bg-dark text-text-secondary hover:text-text-primary"
              }`}
            >
              {format.label}
            </button>
          ))}
        </div>
        {errors.allowedFormats && (
          <p className="text-sm text-red-400">
            {errors.allowedFormats.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t border-bg-dark">
        <button
          type="submit"
          disabled={!isDirty || updateSettings.isPending}
          className="px-6 py-2 bg-primary text-text-primary rounded-lg font-medium transition-colors hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {updateSettings.isPending && (
            <svg
              className="animate-spin h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          Enregistrer
        </button>
      </div>
    </form>
  );
}
