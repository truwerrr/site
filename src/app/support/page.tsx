"use client";
import Link from "next/link";
import { useState } from "react";

export default function SupportPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const supportMethods = [
    {
      icon: "💬",
      title: "WhatsApp",
      contact: "+7(701) 591 49 86",
      href: "https://api.whatsapp.com/send?phone=77015914986",
      description: "Быстрая поддержка через WhatsApp",
      color: "from-green-50 to-green-100",
    },
    {
      icon: "✈️",
      title: "Telegram",
      contact: "@ataixeurasia",
      href: "https://t.me/ataixeurasia",
      description: "Официальный Telegram канал",
      color: "from-blue-50 to-blue-100",
    },
    {
      icon: "📧",
      title: "Email",
      contact: "helpdesk@ataix-p.kz",
      href: "mailto:helpdesk@ataix-p.kz",
      description: "Электронная почта поддержки",
      color: "from-purple-50 to-purple-100",
    },
    {
      icon: "📞",
      title: "Телефон",
      contact: "+7(727) 356 11 70",
      href: "tel:+77273561170",
      description: "Звонок в рабочее время",
      color: "from-yellow-50 to-yellow-100",
    },
  ];

  const faqItems = [
    {
      question: "Как пополнить счёт?",
      answer: "Вы можете пополнить счёт через Kaspi Bank, Home Credit Bank или криптовалютой. Перейдите в раздел 'Кошелёк' → 'Пополнить' для выбора способа. Минимальная сумма пополнения составляет 10 USDT или эквивалент в другой валюте.",
    },
    {
      question: "Какие комиссии за торговлю?",
      answer: "Комиссии зависят от объёма торговли за 30 дней. Maker комиссия от 0% до 0.28%, Taker комиссия от 0.20% до 0.38%. Чем больше ваш объём торговли, тем ниже комиссия. Подробнее в разделе 'Комиссии'.",
    },
    {
      question: "Как вывести средства?",
      answer: "Перейдите в раздел 'Кошелёк' → 'Вывести', выберите валюту, сумму и адрес кошелька или банковский счёт. Комиссия зависит от выбранной валюты и сети. Вывод обрабатывается в течение 1-24 часов после подтверждения.",
    },
    {
      question: "Что такое P2P торговля?",
      answer: "P2P (peer-to-peer) торговля позволяет покупать и продавать криптовалюту напрямую другим пользователям с гарантией безопасности через систему escrow. Все сделки защищены, средства удерживаются до подтверждения получения платежа.",
    },
    {
      question: "Как пройти верификацию?",
      answer: "Для прохождения верификации перейдите в раздел 'Профиль' → 'Настройки' → 'Верификация'. Вам потребуется загрузить фото паспорта или удостоверения личности, а также подтверждение адреса. Процесс обычно занимает 1-3 рабочих дня.",
    },
    {
      question: "Безопасна ли платформа?",
      answer: "Да, ATAIX Eurasia использует современные методы защиты, включая двухфакторную аутентификацию (2FA), холодное хранение активов, лицензию AFSA и регулярные аудиты безопасности. Большая часть средств хранится в холодных кошельках, недоступных для хакеров.",
    },
  ];

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">Служба поддержки</h1>
        <p className="text-gray-600 max-w-prose">
          Мы всегда готовы помочь вам. Свяжитесь с нами любым удобным способом.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {supportMethods.map((method, i) => (
          <Link
            key={i}
            href={method.href}
            target={method.href.startsWith('http') ? '_blank' : undefined}
            rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className={`rounded-xl border bg-gradient-to-br ${method.color} p-4 md:p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1`}
          >
            <div className="text-3xl md:text-4xl mb-2 md:mb-3">{method.icon}</div>
            <div className="font-semibold text-base md:text-lg text-gray-900 mb-1">{method.title}</div>
            <div className="text-primary font-medium mb-1 md:mb-2 text-sm md:text-base break-all">{method.contact}</div>
            <div className="text-xs md:text-sm text-gray-700">{method.description}</div>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Часто задаваемые вопросы</h2>
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <div key={i} className="rounded-lg border bg-gray-50 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 pr-4">{item.question}</h3>
                <svg
                  className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === i && (
                <div className="px-4 pb-4 text-gray-600 animate-fade-in">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Рабочее время</h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex justify-between items-center pb-3 border-b">
              <span>Понедельник - Пятница:</span>
              <span className="font-semibold text-gray-900">09:00 - 18:00</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span>Суббота - Воскресенье:</span>
              <span className="font-semibold text-gray-900">10:00 - 16:00</span>
            </div>
            <div className="pt-2">
              <div className="text-sm text-gray-600 mb-1">Время указано по Алматы (GMT+6)</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Адрес офиса</h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <div className="font-semibold text-gray-900 mb-1">ATAIX Eurasia</div>
                <div className="text-sm">
                  Z05T3D8, РК, г. Астана<br />
                  Мангылик Ел, 55/17<br />
                  офис 138, 139, 140
                </div>
              </div>
            </div>
            <div className="pt-2 border-t">
              <Link
                href="https://maps.google.com/?q=Astana+Mangilik+El+55/17"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 text-sm font-semibold"
              >
                Открыть на карте
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-primary/5 p-6">
        <h2 className="text-xl font-bold mb-3 text-gray-900">Не нашли ответ?</h2>
        <p className="text-gray-700 mb-4">
          Если у вас остались вопросы, свяжитесь с нами любым удобным способом. Мы ответим в течение 24 часов.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="https://api.whatsapp.com/send?phone=77015914986"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg bg-green-500 text-white hover:opacity-90 font-semibold"
          >
            Написать в WhatsApp
          </Link>
          <Link
            href="https://t.me/ataixeurasia"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg bg-blue-500 text-white hover:opacity-90 font-semibold"
          >
            Написать в Telegram
          </Link>
          <Link
            href="mailto:helpdesk@ataix-p.kz"
            className="px-6 py-3 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold"
          >
            Отправить Email
          </Link>
        </div>
      </div>
    </div>
  );
}
