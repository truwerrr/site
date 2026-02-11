"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Notifications from "./Notifications";
import HeaderAuthBar from "./HeaderAuthBar";
import { TradeIcon, WalletIcon, ExchangeIcon, P2PIcon } from "./Icons";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const auth = status === "authenticated";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const nav = [
    { href: "/", label: "Главная" },
    { href: "/trade", label: "Биржа", icon: TradeIcon },
    { href: "/wallet", label: "Кошелёк", icon: WalletIcon },
    { href: "/exchange", label: "Обмен", icon: ExchangeIcon },
    { href: "/p2p", label: "P2P", icon: P2PIcon },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? "shadow-lg shadow-black/8" : ""
    }`}>
      <div className="h-1 bg-gradient-to-r from-[#DCE0E6] via-[#D4D8E0] to-[#CCD0D8]" aria-hidden />
      <div className="bg-gradient-to-r from-[#E0E4EC] to-[#D4D8E0] border-b border-gray-300/70">
        <div className="container flex h-14 md:h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0 hover:opacity-90 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="111" height="45" viewBox="0 0 111 45" fill="none" aria-label="ATAIX Eurasia logo" className="h-9 w-auto md:h-10">
              <path fill="#2F2D42" d="M0 44.248V37.6656H3.97355V38.3727H0.797282V40.5968H3.7678V41.3039H0.797282V43.5409H4.02499V44.248H0Z" />
              <path fill="#2F2D42" d="M21.9529 37.6656H22.7502V42.0238C22.7502 42.4738 22.6441 42.8756 22.4319 43.2291C22.2219 43.5805 21.925 43.858 21.5414 44.0615C21.1578 44.263 20.7077 44.3637 20.1912 44.3637C19.6746 44.3637 19.2246 44.263 18.8409 44.0615C18.4573 43.858 18.1594 43.5805 17.9472 43.2291C17.7372 42.8756 17.6322 42.4738 17.6322 42.0238V37.6656H18.4294V41.9596C18.4294 42.281 18.5002 42.567 18.6416 42.8177C18.7831 43.0663 18.9845 43.2623 19.246 43.4059C19.5096 43.5473 19.8247 43.618 20.1912 43.618C20.5577 43.618 20.8727 43.5473 21.1363 43.4059C21.4 43.2623 21.6014 43.0663 21.7407 42.8177C21.8822 42.567 21.9529 42.281 21.9529 41.9596V37.6656Z" />
              <path fill="#2F2D42" d="M36.5639 44.248V37.6656H38.7886C39.303 37.6656 39.7252 37.7535 40.0552 37.9292C40.3853 38.1027 40.6296 38.3416 40.7882 38.6459C40.9468 38.9502 41.0261 39.2962 41.0261 39.684C41.0261 40.0719 40.9468 40.4158 40.7882 40.7157C40.6296 41.0157 40.3864 41.2514 40.0584 41.4228C39.7305 41.5921 39.3115 41.6767 38.8014 41.6767H37.0011V40.9568H38.7757C39.1272 40.9568 39.4101 40.9054 39.6244 40.8025C39.8409 40.6997 39.9974 40.554 40.0938 40.3654C40.1924 40.1747 40.2417 39.9476 40.2417 39.684C40.2417 39.4205 40.1924 39.1901 40.0938 38.993C39.9952 38.7959 39.8377 38.6438 39.6212 38.5366C39.4048 38.4273 39.1186 38.3727 38.7629 38.3727H37.3612V44.248H36.5639ZM39.663 41.291L41.2833 44.248H40.3574L38.7629 41.291H39.663Z" />
              <path fill="#2F2D42" d="M54.8463 44.248H54.0104L56.428 37.6656H57.251L59.6685 44.248H58.8327L56.8652 38.707H56.8137L54.8463 44.248ZM55.1549 41.6767H58.524V42.3838H55.1549V41.6767Z" />
              <path fill="#2F2D42" d="M76.5163 39.3112C76.4777 38.9855 76.3212 38.7327 76.0469 38.5527C75.7726 38.3727 75.4361 38.2827 75.0374 38.2827C74.7459 38.2827 74.4909 38.3298 74.2723 38.4241C74.0558 38.5184 73.8865 38.648 73.7643 38.813C73.6443 38.978 73.5843 39.1655 73.5843 39.3755C73.5843 39.5512 73.6261 39.7022 73.7097 39.8287C73.7954 39.9529 73.9047 40.0569 74.0376 40.1404C74.1705 40.2218 74.3098 40.2893 74.4555 40.3429C74.6013 40.3943 74.7352 40.4361 74.8574 40.4683L75.5261 40.6482C75.6976 40.6932 75.8883 40.7554 76.0983 40.8347C76.3105 40.9139 76.513 41.0221 76.7059 41.1593C76.901 41.2943 77.0617 41.4678 77.1882 41.6799C77.3146 41.8921 77.3778 42.1524 77.3778 42.461C77.3778 42.8166 77.2846 43.138 77.0981 43.4252C76.9138 43.7123 76.6438 43.9405 76.288 44.1098C75.9344 44.279 75.5047 44.3637 74.9989 44.3637C74.5273 44.3637 74.1191 44.2876 73.774 44.1355C73.4311 43.9833 73.161 43.7712 72.9639 43.4991C72.7688 43.227 72.6584 42.9109 72.6327 42.551H73.4557C73.4772 42.7995 73.5607 43.0052 73.7065 43.168C73.8544 43.3287 74.0408 43.4487 74.2659 43.528C74.493 43.6052 74.7374 43.6437 74.9989 43.6437C75.3032 43.6437 75.5765 43.5944 75.8186 43.4959C76.0608 43.3952 76.2526 43.2559 76.3941 43.0781C76.5356 42.8981 76.6063 42.6881 76.6063 42.4481C76.6063 42.2295 76.5452 42.0517 76.423 41.9146C76.3009 41.7774 76.1401 41.666 75.9408 41.5803C75.7415 41.4946 75.5261 41.4196 75.2946 41.3553L74.4845 41.1239C73.9701 40.9761 73.5629 40.765 73.2628 40.4908C72.9628 40.2165 72.8128 39.8576 72.8128 39.4141C72.8128 39.0455 72.9124 38.7241 73.1117 38.4498C73.3132 38.1734 73.5832 37.9592 73.9219 37.807C74.2627 37.6528 74.6431 37.5756 75.0632 37.5756C75.4875 37.5756 75.8647 37.6517 76.1948 37.8038C76.5248 37.9538 76.7863 38.1595 76.9792 38.4209C77.1742 38.6823 77.2771 38.9791 77.2878 39.3112H76.5163Z" />
              <path fill="#2F2D42" d="M91.7075 37.6656V44.248H90.9103V37.6656H91.7075Z" />
              <path fill="#2F2D42" d="M105.798 44.248H104.962L107.379 37.6656H108.202L110.62 44.248H109.784L107.817 38.707H107.765L105.798 44.248ZM106.106 41.6767H109.476V42.3838H106.106V41.6767Z" />
              <path fill="#2F2D42" fillRule="evenodd" clipRule="evenodd" d="M14.0584 0.254116L25.0375 27.369C25.099 27.5908 24.9334 27.8102 24.7046 27.8102H22.4106C22.2699 27.8102 22.143 27.7243 22.0902 27.5929L18.8259 19.4671H9.66215C9.41709 19.4671 9.2498 19.2179 9.34174 18.9891L10.1796 16.9034C10.2325 16.772 10.359 16.6861 10.5 16.6861H17.7088L12.8169 4.50977C12.7004 4.21985 12.2925 4.21985 12.176 4.50977L2.90307 27.5929C2.85019 27.7243 2.72368 27.8102 2.58266 27.8102H0.345989C0.100927 27.8102 -0.0663652 27.5609 0.0255763 27.3322L10.9182 0.217267C10.9711 0.085864 11.0976 0 11.2386 0H13.7256C13.8804 0 14.0166 0.103941 14.0584 0.254116ZM44.7609 0H24.0222C23.8314 0 23.6766 0.155737 23.6766 0.347627V2.43339C23.6766 2.62528 23.8314 2.78102 24.0222 2.78102H44.7609C44.9517 2.78102 45.1066 2.62528 45.1066 2.43339V0.347627C45.1066 0.155737 44.9517 0 44.7609 0ZM35.4286 5.56203H33.3547C33.164 5.56203 33.0091 5.71777 33.0091 5.90966V27.4626C33.0091 27.6544 33.164 27.8102 33.3547 27.8102H35.4286C35.6194 27.8102 35.7743 27.6544 35.7743 27.4626V5.90966C35.7743 5.71777 35.6194 5.56203 35.4286 5.56203ZM79.4982 27.8102H77.4243C77.2335 27.8102 77.0787 27.6544 77.0787 27.4626V0.347627C77.0787 0.155737 77.2335 0 77.4243 0H79.4982C79.689 0 79.8439 0.155737 79.8439 0.347627V27.4626C79.8439 27.6544 79.689 27.8102 79.4982 27.8102ZM58.0461 0.254115L69.0252 27.369C69.0867 27.5908 68.9208 27.8102 68.6927 27.8102H66.3987C66.258 27.8102 66.1311 27.7243 66.0782 27.5929L62.814 19.4671H53.6502C53.4052 19.4671 53.2379 19.2175 53.3298 18.9891L54.1677 16.9034C54.2206 16.772 54.3471 16.6861 54.4881 16.6861H61.6965L56.8046 4.50977C56.6881 4.21985 56.2802 4.21985 56.1638 4.50977L46.8908 27.5929C46.8379 27.7243 46.7114 27.8102 46.5704 27.8102H44.3337C44.0887 27.8102 43.9214 27.5606 44.0133 27.3322L54.906 0.217267C54.9588 0.0858635 55.0854 0 55.2264 0H57.7133C57.8681 0 58.0043 0.10394 58.0461 0.254115Z" />
              <path fillRule="evenodd" clipRule="evenodd" d="M97.3034 14.1095L87.9722 27.2582C87.8092 27.4879 87.9694 27.8102 88.2469 27.8102H90.765C90.8736 27.8102 90.9758 27.757 91.0397 27.667L100.661 14.1095C100.748 13.9878 100.748 13.8227 100.661 13.7007L99.1272 11.5395L91.04 0.143222C90.9762 0.053187 90.874 0 90.7653 0H88.2472C87.9698 0 87.8095 0.322251 87.9725 0.552032L97.3038 13.7007C97.39 13.8227 97.39 13.9875 97.3034 14.1095Z" fill="#656FFF" />
              <path fillRule="evenodd" clipRule="evenodd" d="M102.21 11.1522C102.346 11.3434 102.624 11.3434 102.76 11.1522L110.282 0.551685C110.446 0.322251 110.285 0 110.008 0H107.49C107.381 0 107.279 0.053187 107.215 0.143222L100.951 8.96948C100.865 9.0915 100.865 9.25627 100.951 9.37829L102.21 11.1522Z" fill="#24F0BF" />
              <path fillRule="evenodd" clipRule="evenodd" d="M102.76 16.6579C102.624 16.4667 102.346 16.4667 102.21 16.6579L100.951 18.4322C100.865 18.5542 100.865 18.719 100.951 18.841L107.215 27.6673C107.279 27.7573 107.381 27.8105 107.49 27.8105H110.008C110.285 27.8105 110.445 27.4883 110.282 27.2585L102.76 16.6579Z" fill="#24F0BF" />
            </svg>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5 rounded-xl bg-gray-100/80 p-1 border border-gray-200/60">
            {nav.map((n) => {
              const IconComponent = n.icon;
              const isActive = pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href));
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive ? "bg-white text-[#2F2D42] shadow-sm" : "text-gray-600 hover:text-[#2F2D42] hover:bg-white/70"
                  }`}
                >
                  {IconComponent ? (
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${isActive ? "bg-gray-100" : ""}`}>
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                  ) : null}
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0 ml-6">
          {auth ? (
            <>
                <Link
                  href="/profile"
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-[#2F2D42] hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-[#2F2D42] ring-2 ring-gray-200">
                    {session?.user?.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden lg:inline max-w-[120px] truncate">{session?.user?.email?.split("@")[0] || "Профиль"}</span>
                </Link>
                <Link
                  href="/wallet?tab=deposit"
                  className="hidden md:inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-semibold text-[#2F2D42] hover:bg-gray-50 transition-colors shrink-0"
                >
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Депозит
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden md:block text-sm px-3 py-2 rounded-xl text-gray-600 hover:text-[#2F2D42] hover:bg-gray-100 font-medium transition-colors"
                >
                  Выйти
                </button>
            </>
            ) : (
              <>
                <Link
                  href="/sessions/signin"
                  className="hidden md:block text-sm px-3 py-2 rounded-xl text-gray-600 hover:text-[#2F2D42] hover:bg-gray-100 font-medium transition-colors"
                >
                  Войти
                </Link>
                <Link
                  href="/sessions/signup"
                  className="hidden md:block text-sm px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 font-semibold shadow-md transition-all"
                >
                  Регистрация
                </Link>
              </>
            )}
            <span className="hidden md:block w-px h-6 bg-gray-200" />
            <button
              type="button"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 hover:bg-gray-200/80 transition-colors"
            >
              RU
            </button>
            {auth && (
              <div className="text-gray-600 [&_button]:hover:bg-gray-100 [&_button]:hover:text-[#2F2D42]">
                <Notifications />
              </div>
            )}
            <button
              aria-label="Меню"
              onClick={() => setOpen((v) => !v)}
              className="md:hidden inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
            >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {open ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
        </div>
      </div>

      <div
        className="md:hidden overflow-hidden transition-[max-height] duration-300 ease-out"
        style={{ maxHeight: open ? "85vh" : 0 }}
      >
        <div className="border-t border-gray-300/70 bg-gradient-to-r from-[#E0E4EC] to-[#D4D8E0] overflow-y-auto max-h-[85vh]">
          <div className="container py-3 flex flex-col gap-0.5">
            {nav.map((n) => {
              const IconComponent = n.icon;
              const isActive = pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href));
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-xl transition-colors touch-manipulation ${
                    isActive ? "bg-primary/10 text-primary font-medium" : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {IconComponent ? (
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? "bg-primary/20" : "bg-gray-100"}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-lg">⌂</div>
                  )}
                  {n.label}
                </Link>
              );
            })}
            {auth ? (
              <>
                <Link
                  href="/profile"
                  className="px-4 py-3 min-h-[48px] rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center gap-3 touch-manipulation"
                  onClick={() => setOpen(false)}
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center font-semibold text-[#2F2D42] shrink-0">
                    {session?.user?.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  Профиль
                </Link>
                <Link
                  href="/wallet?tab=deposit"
                  className="px-4 py-3 min-h-[48px] rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center gap-3 touch-manipulation"
                  onClick={() => setOpen(false)}
                >
                  <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Депозит
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="px-4 py-3 min-h-[48px] rounded-xl border border-gray-200 text-left text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation w-full"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sessions/signin"
                  className="px-4 py-3 min-h-[48px] rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center touch-manipulation"
                  onClick={() => setOpen(false)}
                >
                  Войти
                </Link>
                <Link
                  href="/sessions/signup"
                  className="px-4 py-3 min-h-[48px] rounded-xl bg-primary text-white hover:opacity-90 active:opacity-80 font-semibold text-center touch-manipulation"
                  onClick={() => setOpen(false)}
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {auth && <HeaderAuthBar />}
    </header>
  );
}
