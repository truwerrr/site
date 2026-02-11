"use client";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

const nav = [
  { href: "/admin", label: "Главная" },
  { href: "/admin/p2p", label: "P2P сделки" },
  { href: "/admin/users", label: "Пользователи" },
] as const;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/sessions/signin");
      return;
    }
    if (status === "authenticated" && (session?.user as { role?: string })?.role !== "admin") {
      router.replace("/");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (status === "authenticated" && (session?.user as { role?: string })?.role !== "admin") {
    return null;
  }

  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container flex items-center justify-between h-14">
          <Link href="/admin" className="font-bold text-lg text-gray-900 tracking-tight">
            Админ-панель
          </Link>
          <nav className="flex items-center gap-1">
            {nav.map(({ href, label }) => {
              const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            <span className="w-px h-5 bg-gray-200 mx-2" aria-hidden />
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ← На сайт
            </Link>
          </nav>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
