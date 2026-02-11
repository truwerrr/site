"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface UserRow {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  _count: { balances: number };
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;
    const url = search ? `/api/admin/users?q=${encodeURIComponent(search)}` : "/api/admin/users";
    setLoading(true);
    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [status, search]);

  if (status !== "authenticated") return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Пользователи</h1>
      <p className="text-gray-500 text-sm mb-4">
        Список зарегистрированных пользователей. Нажмите на пользователя, чтобы изменить балансы по валютам.
      </p>
      <div className="mb-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по email..."
          className="w-full max-w-sm rounded-xl border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 border-b border-gray-200">
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Роль</th>
                  <th className="p-4 font-semibold">Регистрация</th>
                  <th className="p-4 font-semibold">Балансов</th>
                  <th className="p-4 font-semibold text-right">Действие</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50/80">
                    <td className="p-4 font-medium text-gray-900">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${u.role === "admin" ? "bg-violet-100 text-violet-800" : "bg-gray-100 text-gray-700"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{new Date(u.createdAt).toLocaleString("ru-RU")}</td>
                    <td className="p-4 text-gray-600">{u._count.balances}</td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                      >
                        Балансы
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
