"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [requiresTOTP, setRequiresTOTP] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        totp: requiresTOTP ? totp : undefined,
        redirect: false,
      });

      if (result == null) {
        setError("Нет ответа от сервера. Проверьте подключение.");
        return;
      }
      if (result.error === "TOTP_REQUIRED") {
        setRequiresTOTP(true);
        setError("Введите код 2FA");
        return;
      }
      if (result.error) {
        setError("Неверный email или пароль");
        return;
      }
      if (result.ok) {
        window.location.href = "/profile";
        return;
      }
      setError("Ошибка входа");
    } catch (err) {
      console.error("SignIn error:", err);
      const msg = err instanceof Error ? err.message : "Ошибка входа";
      setError(
        process.env.NODE_ENV === "development"
          ? `Ошибка входа. ${msg}`
          : "Ошибка входа. Проверьте подключение и попробуйте снова."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-6 sm:py-12 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-white shadow-xl p-5 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Вход</h1>
            <p className="text-gray-600">Войдите в свой аккаунт ATAIX</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full rounded-lg border-2 border-[#edb419] bg-white text-[#2f2d42] px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-[#edb419]/50 transition-all touch-manipulation"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Пароль</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border-2 border-[#edb419] bg-white text-[#2f2d42] px-4 py-3 pr-12 min-h-[48px] focus:ring-2 focus:ring-[#edb419]/50 transition-all touch-manipulation"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {requiresTOTP && (
              <div className="animate-fade-in">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Код 2FA</label>
                <input
                  type="text"
                  value={totp}
                  onChange={(e) => setTotp(e.target.value)}
                  required
                  placeholder="000000"
                  maxLength={6}
                  className="w-full rounded-lg border-2 border-[#edb419] bg-white text-[#2f2d42] px-4 py-3 min-h-[48px] text-center text-2xl tracking-widest focus:ring-2 focus:ring-[#edb419]/50 transition-all touch-manipulation"
                />
                <p className="text-xs text-gray-500 mt-2">Введите 6-значный код из приложения-аутентификатора</p>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] px-4 py-3.5 rounded-lg bg-primary text-white hover:opacity-90 active:opacity-80 disabled:opacity-50 font-semibold shadow-md transition-all touch-manipulation"
            >
              {loading ? "Вход..." : "Войти"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Нет аккаунта? </span>
            <Link href="/sessions/signup" className="text-primary font-semibold hover:underline">
              Зарегистрироваться
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
