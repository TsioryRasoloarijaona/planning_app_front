import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { SquarePen, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { patch } from "@/hooks/fecthing/patch";

export default function Pwd() {
  const [open, setOpen] = useState(false);
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [loading, setLoading] = useState(false);

  // Critères
  const hasMinLen = pwd.length >= 6;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasDigit = /\d/.test(pwd);
  const allOk = hasMinLen && hasUpper && hasDigit;
  const match = pwd !== "" && pwd === confirmPwd;

  const canSubmit = allOk && match && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setLoading(true);
      await patch(`account/pwd?pwd=${encodeURIComponent(pwd)}`);

      toast.success("votre mot de passe a été mis à jour");

      setPwd("");
      setConfirmPwd("");
      setOpen(false);
    } catch (err: any) {
      toast.error("echec de la mis à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          aria-label="Modifier le mot de passe"
          className="inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100"
        >
          <SquarePen size={18} />
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier votre mot de passe</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Mot de passe */}
          <div>
            <label className="block text-sm text-gray-700">Mot de passe</label>
            <input
              type="password"
              className="mt-1 w-full px-3 py-2 rounded-md border"
              placeholder="*******"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
            />

            {/* Checklist des critères */}
            <ul className="mt-2 space-y-1 text-xs">
              <li
                className={`flex items-center gap-2 ${
                  hasMinLen ? "text-green-600" : "text-gray-500"
                }`}
              >
                {hasMinLen ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                Au moins 6 caractères
              </li>
              <li
                className={`flex items-center gap-2 ${
                  hasUpper ? "text-green-600" : "text-gray-500"
                }`}
              >
                {hasUpper ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                Au moins une majuscule
              </li>
              <li
                className={`flex items-center gap-2 ${
                  hasDigit ? "text-green-600" : "text-gray-500"
                }`}
              >
                {hasDigit ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                Au moins un chiffre
              </li>
            </ul>
          </div>

          {/* Confirmation */}
          <div>
            <label className="block text-sm text-gray-700">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              className="mt-1 w-full px-3 py-2 rounded-md border"
              placeholder="*******"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
            />
            {confirmPwd !== "" && !match && (
              <p className="mt-1 text-xs text-red-600">
                Les mots de passe ne correspondent pas.
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-3 py-2 text-white bg-gray-700 rounded-md disabled:opacity-50 inline-flex items-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Modifier
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
