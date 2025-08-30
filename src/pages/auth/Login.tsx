import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/authConf/AuthContext";
import { Loader2 } from "lucide-react";
import type { LoginRes } from "@/interfaces/LoginRes";

type FormValues = {
  email: string;
  password: string;
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from?.pathname as string | undefined;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();
  const { refresh } = useAuth();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    try {
      setLoading(true);

      const res = await fetch(`${baseUrl}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Unauthorized");

      const cre: LoginRes = await res.json();
      await refresh();
      const dest = from ?? (cre.account.role === "ADMIN" ? "/admin" : "/user");
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error("Invalid credentials");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-8 pt-10 pb-8"
          aria-busy={loading}
        >
          <div className="text-center mb-8 w-[125px] mx-auto">
            <img src="/logo1.png" alt="Logo" className="mx-auto w-auto" />
          </div>

          <label className="block text-sm font-medium text-gray-700">
            adresse email
          </label>
          <div className="mt-1">
            <input
              type="email"
              placeholder="Enter your email"
              disabled={loading} // ⬅️ disable during loading
              {...register("email", { required: true })}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30 disabled:opacity-60"
            />
            {errors.email && (
              <span className="text-sm text-red-500">ce champ est requis</span>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              mot de passe
            </label>
          </div>
          <div className="mt-1 relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={loading} // ⬅️
              {...register("password", { required: true })}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-11 text-gray-900 placeholder-gray-400 shadow-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30 disabled:opacity-60"
            />
            {errors.password && (
              <span className="text-sm text-red-500">ce champ est requis</span>
            )}
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              disabled={loading} // ⬅️
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 disabled:opacity-60"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOffIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading} // ⬅️
            className="mt-12 inline-flex w-full items-center justify-center rounded-md bg-gray-700 px-4 py-3 text-white font-medium hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-violet-500/30 active:scale-[0.99] disabled:opacity-60"
          >
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {loading ? "Connexion en cours..." : "se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}

function EyeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a21.82 21.82 0 015.06-6.94M9.9 4.24A10.94 10.94 0 0112 4c7 0 11 8 11 8a21.82 21.82 0 01-4.87 6.82M1 1l22 22" />
    </svg>
  );
}
