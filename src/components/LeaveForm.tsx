import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
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
  // format yyyy-mm-dd
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function LeaveForm() {
  const queryClient = useQueryClient();

  // J+2 à partir d'aujourd'hui (locale)
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

  const watchStart = watch("StartDate"); // re-render min du EndDate

  // min dynamique de EndDate: start + 1 jour si start défini, sinon J+2
  const minEndDateStr = React.useMemo(() => {
    if (watchStart) {
      const start = new Date(watchStart);
      return toInputDate(addDays(start, 1)); // strictement après Start
    }
    return toInputDate(addDays(new Date(minStartDateStr), 1));
  }, [watchStart, minStartDateStr]);

  const onsubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      await post<string, FormValues>("leave", data);
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      toast.success("Demande envoyée avec succès");
      reset(); // optionnel : vider le formulaire
    } catch (error) {
      toast.error("Erreur lors de l'envoi de la demande");
      console.error(error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <div className="px-4 py-2 bg-gray-700 text-white rounded-lg flex items-center">
          <Plus className="inline-block" />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Veuillez remplir votre demande</DialogTitle>

          <form className="space-y-4 mt-8" onSubmit={handleSubmit(onsubmit)}>
            <div className="grid grid-cols-2 gap-4">
              {/* StartDate */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date de début
                </label>
                <input
                  type="date"
                  min={minStartDateStr} // ⟵ J+2
                  className="px-3 py-2 mt-2 block w-full rounded-md border border-gray-300 focus:ring-gray-700"
                  {...register("StartDate", {
                    required: "Ce champ est requis",
                    validate: (value) => {
                      if (!value) return true;
                      // value >= J+2
                      const v = new Date(value);
                      const min = new Date(minStartDateStr);
                      return (
                        v >= min || `Choisir une date ≥ ${minStartDateStr}`
                      );
                    },
                  })}
                />
                {errors.StartDate && (
                  <span className="text-sm text-red-600">
                    {errors.StartDate.message || "Ce champ est requis"}
                  </span>
                )}
              </div>

              {/* EndDate */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date de fin
                </label>
                <input
                  type="date"
                  min={minEndDateStr} // ⟵ au moins start + 1 jour
                  className="px-3 py-2 mt-2 block w-full rounded-md border border-gray-300 focus:ring-gray-700"
                  {...register("EndDate", {
                    required: "Ce champ est requis",
                    validate: (value, form) => {
                      if (!value) return true;
                      const end = new Date(value);
                      const start = form.StartDate
                        ? new Date(form.StartDate)
                        : null;

                      // fin ≥ J+2 aussi (au cas où start non rempli)
                      const minAbsolute = new Date(minStartDateStr);
                      if (end < minAbsolute) {
                        return `Choisir une date ≥ ${minStartDateStr}`;
                      }

                      // fin strictement après start s'il est défini
                      if (start && !(end > start)) {
                        return "La date de fin doit être strictement après la date de début";
                      }
                      return true;
                    },
                  })}
                />
                {errors.EndDate && (
                  <span className="text-sm text-red-600">
                    {errors.EndDate.message || "Ce champ est requis"}
                  </span>
                )}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Motif du congé ou note additionnelle"
                className="mt-2 w-full p-4 rounded-md border border-gray-300 focus:ring-gray-700"
                {...register("Reason", { required: "Ce champ est requis" })}
              />
              {errors.Reason && (
                <span className="text-sm text-red-600">
                  {errors.Reason.message}
                </span>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-black"
              >
                Envoyer la demande
              </button>
            </div>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
