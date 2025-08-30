import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import { post } from "@/hooks/fecthing/post";
import { toast } from "sonner";
import React from "react";

type FormValues = {
  StartDate: string; // yyyy-mm-dd
  EndDate: string; // yyyy-mm-dd
  Reason: string;
};

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}
function toInputDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function LeaveForm() {
  const queryClient = useQueryClient();

  // contrôle du Dialog + loader
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const minStartDateStr = React.useMemo(() => {
    const today = new Date();
    const j2 = addDays(today, 2);
    return toInputDate(j2);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormValues>();

  const watchStart = watch("StartDate");

  const minEndDateStr = React.useMemo(() => {
    if (watchStart) {
      const start = new Date(watchStart);
      return toInputDate(addDays(start, 1));
    }
    return toInputDate(addDays(new Date(minStartDateStr), 1));
  }, [watchStart, minStartDateStr]);

  const onsubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setLoading(true);
      await post<string, FormValues>("leave", data);
      await queryClient.invalidateQueries({ queryKey: ["leaves"] });
      toast.success("Demande envoyée avec succès");
      reset();
      setOpen(false); // ferme le dialog au succès
    } catch (error) {
      toast.error("Erreur lors de l'envoi de la demande");
      console.error(error);
    } finally {
      setLoading(false); // stoppe le loader
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-60 sm:w-auto"
          onClick={() => setOpen(true)}
          disabled={loading}
        >
          <Plus className="h-5 w-5" />
        </button>
      </DialogTrigger>

      <DialogContent
        className="
          w-[calc(100vw-2rem)]
          max-w-[min(100vw-2rem,42rem)]
          sm:max-w-[560px]
          p-4 sm:p-6 md:p-8
          max-h-[85vh] overflow-y-auto
        "
      >
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg text-left">
            Veuillez remplir votre demande
          </DialogTitle>

          <form
            className="space-y-4 sm:space-y-6 mt-6 sm:mt-8"
            onSubmit={handleSubmit(onsubmit)}
            aria-busy={loading}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* StartDate */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 text-left">
                  Date de début
                </label>
                <input
                  type="date"
                  min={minStartDateStr}
                  disabled={loading}
                  className="px-3 py-2 mt-2 block w-full rounded-md border border-gray-300 focus:ring-gray-700 disabled:opacity-60 text-sm sm:text-base"
                  {...register("StartDate", {
                    required: "Ce champ est requis",
                    validate: (value) => {
                      if (!value) return true;
                      const v = new Date(value);
                      const min = new Date(minStartDateStr);
                      return (
                        v >= min || `Choisir une date ≥ ${minStartDateStr}`
                      );
                    },
                  })}
                />
                {errors.StartDate && (
                  <span className="text-xs sm:text-sm text-red-600">
                    {errors.StartDate.message || "Ce champ est requis"}
                  </span>
                )}
              </div>

              {/* EndDate */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 text-left">
                  Date de fin
                </label>
                <input
                  type="date"
                  min={minEndDateStr}
                  disabled={loading}
                  className="px-3 py-2 mt-2 block w-full rounded-md border border-gray-300 focus:ring-gray-700 disabled:opacity-60 text-sm sm:text-base"
                  {...register("EndDate", {
                    required: "Ce champ est requis",
                    validate: (value, form) => {
                      if (!value) return true;
                      const end = new Date(value);
                      const start = form.StartDate
                        ? new Date(form.StartDate)
                        : null;
                      const minAbsolute = new Date(minStartDateStr);
                      if (end < minAbsolute)
                        return `Choisir une date ≥ ${minStartDateStr}`;
                      if (start && !(end > start)) {
                        return "La date de fin doit être strictement après la date de début";
                      }
                      return true;
                    },
                  })}
                />
                {errors.EndDate && (
                  <span className="text-xs sm:text-sm text-red-600">
                    {errors.EndDate.message || "Ce champ est requis"}
                  </span>
                )}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 text-left">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Motif du congé ou note additionnelle"
                disabled={loading}
                className="mt-2 w-full p-3 sm:p-4 rounded-md border border-gray-300 focus:ring-gray-700 disabled:opacity-60 text-sm sm:text-base h-28 sm:h-32"
                {...register("Reason", { required: "Ce champ est requis" })}
              />
              {errors.Reason && (
                <span className="text-xs sm:text-sm text-red-600">
                  {errors.Reason.message}
                </span>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-md bg-gray-700 text-white hover:bg-black disabled:opacity-60 w-full sm:w-auto"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>
                  {loading ? "Envoi en cours..." : "Envoyer la demande"}
                </span>
              </button>
            </div>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
