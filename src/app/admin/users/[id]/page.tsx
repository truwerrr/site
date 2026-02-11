"use client";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface BalanceRow {
  id: string;
  currency: string;
  available: string;
  locked: string;
}

interface UserDetail {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  balances: BalanceRow[];
}

const CURRENCIES = ["USDT", "BTC", "ETH", "KZT"];

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const id = params.id as string;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("USDT");
  const [addAmount, setAddAmount] = useState("");
  const [setAvailable, setSetAvailable] = useState("");
  const [setLocked, setSetLocked] = useState("");
  const [mode, setMode] = useState<"add" | "set">("add");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchUser = () => {
    fetch(`/api/admin/users/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchUser();
  }, [status, id]);

  const handleBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);
    try {
      const body = mode === "add"
        ? { currency: currency.trim().toUpperCase(), addAvailable: addAmount || undefined }
        : { currency: currency.trim().toUpperCase(), setAvailable: setAvailable || undefined, setLocked: setLocked || undefined };
      const res = await fetch(`/api/admin/users/${id}/balances`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Ошибка");
        return;
      }
      setAddAmount("");
      setSetAvailable("");
      setSetLocked("");
      setMessage("Сохранено");
      fetchUser();
    } catch {
      setMessage("Ошибка сети");
    } finally {
      setSaving(false);
    }
  };

  if (status !== "authenticated") return null;
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!user) {
    return (
      <div>
        <p className="text-gray-600">Пользователь не найден</p>
        <Link href="/admin/users" className="text-primary font-semibold hover:underline mt-2 inline-block">← К списку</Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/users" className="text-sm font-semibold text-primary hover:underline mb-4 inline-block">← Пользователи</Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.email}</h1>
      <p className="text-gray-500 text-sm mb-6">Роль: {user.role} · Регистрация: {new Date(user.createdAt).toLocaleString("ru-RU")}</p>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-6 mb-8">
        <h2 className="font-bold text-lg text-gray-900 mb-4">Изменить баланс</h2>
        <form onSubmit={handleBalanceSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Валюта</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" name="mode" checked={mode === "add"} onChange={() => setMode("add")} className="rounded border-gray-300 text-primary" />
              <span className="text-sm font-medium">Добавить / убавить</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="mode" checked={mode === "set"} onChange={() => setMode("set")} className="rounded border-gray-300 text-primary" />
              <span className="text-sm font-medium">Задать сумму</span>
            </label>
          </div>
          {mode === "add" ? (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Сумма (+ или −)</label>
              <input
                type="text"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="100 или -50"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Доступно</label>
                <input
                  type="text"
                  value={setAvailable}
                  onChange={(e) => setSetAvailable(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Заблокировано</label>
                <input
                  type="text"
                  value={setLocked}
                  onChange={(e) => setSetLocked(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>
            </div>
          )}
          {message && <p className={`text-sm ${message === "Сохранено" ? "text-green-600" : "text-red-600"}`}>{message}</p>}
          <button type="submit" disabled={saving} className="rounded-xl bg-primary px-6 py-2.5 text-white font-semibold text-sm hover:bg-primary/90 disabled:opacity-50">
            {saving ? "Сохранение..." : "Применить"}
          </button>
        </form>
      </div>

      <h2 className="font-bold text-lg text-gray-900 mb-3">Текущие балансы</h2>
      {user.balances.length === 0 ? (
        <p className="text-gray-500">Нет записей. Добавьте баланс выше.</p>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500 border-b border-gray-200">
                <th className="p-4 font-semibold">Валюта</th>
                <th className="p-4 font-semibold">Доступно</th>
                <th className="p-4 font-semibold">Заблокировано</th>
              </tr>
            </thead>
            <tbody>
              {user.balances.map((b) => (
                <tr key={b.id} className="border-b border-gray-100">
                  <td className="p-4 font-medium">{b.currency}</td>
                  <td className="p-4 tabular-nums">{parseFloat(b.available).toLocaleString("ru-RU", { maximumFractionDigits: 8 })}</td>
                  <td className="p-4 tabular-nums">{parseFloat(b.locked).toLocaleString("ru-RU", { maximumFractionDigits: 8 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
