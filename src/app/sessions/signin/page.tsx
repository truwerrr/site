"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuth, setAuthToken } from "@/lib/auth";

export default function SignInPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (checkAuth(username, password)) {
      setAuthToken("demo_admin_token");
      // Триггерим событие для обновления Header
      window.dispatchEvent(new Event('storage'));
      router.push("/profile");
      router.refresh();
    } else {
      setError("Неверный логин или пароль. Используйте: admin / admin");
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Вход</h1>
      <div className="rounded-xl border p-6 bg-white max-w-md">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Логин</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded border-2 border-[#edb419] bg-white text-[#2f2d42] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#edb419]/50"
              placeholder="admin"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border-2 border-[#edb419] bg-white text-[#2f2d42] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#edb419]/50"
              placeholder="admin"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="mt-4 w-full rounded bg-primary text-white py-2 hover:opacity-90">
            Войти
          </button>
          <p className="text-xs text-muted-foreground mt-2">
            Тестовый аккаунт: <strong>admin</strong> / <strong>admin</strong>
          </p>
        </form>
      </div>
    </div>
  );
}
// ... existing code ... <end>
