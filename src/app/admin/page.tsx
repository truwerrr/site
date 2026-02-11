"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface RecentUser {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Stats {
  users: number;
  deals: number;
  dealsPending: number;
  recentUsers?: RecentUser[];
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Главная</h1>
      <p className="text-gray-500 text-sm mb-8">Сводка и быстрый доступ к разделам.</p>

      {loading ? (
        <div className="h-24 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <Link
            href="/admin/users"
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-primary/30 hover:shadow transition-all"
          >
            <div className="text-2xl font-bold text-gray-900 tabular-nums">{stats.users}</div>
            <div className="text-sm text-gray-500 mt-0.5">Пользователей</div>
          </Link>
          <Link
            href="/admin/p2p"
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-primary/30 hover:shadow transition-all"
          >
            <div className="text-2xl font-bold text-gray-900 tabular-nums">{stats.deals}</div>
            <div className="text-sm text-gray-500 mt-0.5">P2P сделок</div>
          </Link>
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">
            <div className="text-2xl font-bold text-amber-800 tabular-nums">{stats.dealsPending}</div>
            <div className="text-sm text-amber-700 mt-0.5">Ожидают оплаты</div>
          </div>
        </div>
      ) : null}

      {stats?.recentUsers && stats.recentUsers.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">Последние регистрации</h2>
          <ul className="space-y-2">
            {stats.recentUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700">{u.email}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${u.role === "admin" ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-600"}`}>
                    {u.role}
                  </span>
                  <Link href={`/admin/users/${u.id}`} className="text-xs font-medium text-primary hover:underline">
                    Балансы
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/admin/users" className="inline-block mt-3 text-sm font-medium text-primary hover:underline">
            Все пользователи →
          </Link>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">Быстрые действия</h2>
        <ul className="space-y-3">
          <li>
            <Link
              href="/admin/p2p"
              className="text-primary font-medium hover:underline"
            >
              P2P сделки
            </Link>
            <span className="text-gray-500 ml-2 text-sm">— сделки с ботами, чат с пользователем</span>
          </li>
          <li>
            <Link
              href="/admin/users"
              className="text-primary font-medium hover:underline"
            >
              Пользователи
            </Link>
            <span className="text-gray-500 ml-2 text-sm">— список, управление балансами</span>
          </li>
          <li>
            <a
              href="/api/init-p2p-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline"
            >
              Подготовить P2P
            </a>
            <span className="text-gray-500 ml-2 text-sm">— создать бота и объявление-заглушку</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
