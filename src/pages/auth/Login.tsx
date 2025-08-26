import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";

type FormValues = {
  email: string;
  password: string;
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();
  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log(data);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative rounded-2xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden"
        >
          <div className="absolute inset-x-0 -top-20 h-40 bg-gradient-to-b from-violet-100/80 to-transparent blur-2xl pointer-events-none" />

          <div className="px-8 pt-10 pb-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">
                Bienvenue
              </h1>
            </div>

            <label className="block text-sm font-medium text-gray-700">
              adresse email
            </label>
            <div className="mt-1">
              <input
                type="email"
                placeholder="Enter your email"
                {...register("email", { required: true })}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
              />
              {errors.email && (
                <span className="text-sm text-red-500">
                  ce champ est requis
                </span>
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
                {...register("password", { required: true })}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-11 text-gray-900 placeholder-gray-400 shadow-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
              />
              {errors.password && (
                <span className="text-sm text-red-500">
                  ce champ est requis
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
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
              className="mt-12 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-white font-medium shadow-lg shadow-violet-600/20 hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-violet-500/30 active:scale-[0.99]"
            >
              se connecter
            </button>
          </div>
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
