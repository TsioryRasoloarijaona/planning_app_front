// src/components/NewAgent.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { post } from "@/hooks/fecthing/post";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AGENTS_QUERY_KEY } from "@/queries/queryKey";

type Role = "ADMIN" | "EMPLOYEE";
type NewAgentPayload = { name: string; email: string; role: Role };
type NewAgentResponse = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
};

export default function NewAgent() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState<NewAgentPayload>({
    name: "",
    email: "",
    role: "EMPLOYEE",
  });

  const change =
    (k: keyof NewAgentPayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: NewAgentPayload) =>
      post<NewAgentResponse, NewAgentPayload>("account", payload),
    onSuccess: (res) => {
      toast.success(
        `Agent créé: ${res.name} (${res.email}). Mot de passe: ${res.password}`
      );
      // Réactualise la liste et la recherche
      qc.invalidateQueries({ queryKey: AGENTS_QUERY_KEY }); // ex: ['agents']
      setOpen(false);
      setForm({ name: "", email: "", role: "EMPLOYEE" });
    },
    onError: (err: unknown) => {
      console.error(err);
      toast.error("Erreur lors de la création de l’agent");
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.warning("Nom et email sont requis");
      return;
    }
    mutate(form);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <p className="text-white bg-gray-700 px-3 py-2 rounded-md flex items-center gap-2">
          <Plus /> ajouter
        </p>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un nouvel agent</DialogTitle>
          <DialogDescription>
            Vous allez recevoir le mot de passe de cet agent — veillez le noter.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4 mt-2" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700">Nom</label>
              <input
                type="text"
                value={form.name}
                onChange={change("name")}
                className="mt-1 w-full px-3 py-2 rounded-md border"
                placeholder="Ex: Alex Dupont"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={change("email")}
                className="mt-1 w-full px-3 py-2 rounded-md border"
                placeholder="Ex: alex@email.com"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700">Rôle</label>
              <select
                value={form.role}
                onChange={change("role")}
                className="mt-1 w-full px-3 py-2 rounded-md border"
              >
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              className="px-3 py-2 rounded-md border"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-gray-700 text-white disabled:opacity-50"
              disabled={isPending}
            >
              {isPending ? "Envoi..." : "Créer l’agent"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
