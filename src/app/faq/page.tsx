"use client";
import { useState } from "react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Как зарегистрироваться на ATAIX Eurasia?",
      answer: "Нажмите кнопку 'Регистрация' в правом верхнем углу, введите email и создайте пароль. После регистрации вам нужно будет пройти верификацию для полного доступа к функциям платформы.",
    },
    {
      question: "Какие документы нужны для верификации?",
      answer: "Для полной верификации потребуется паспорт или удостоверение личности, а также подтверждение адреса проживания. Процесс верификации обычно занимает 1-3 рабочих дня.",
    },
    {
      question: "Как пополнить счёт?",
      answer: "Вы можете пополнить счёт через партнёрские банки Казахстана (Kaspi Bank, Home Credit Bank), а также криптовалютой. Перейдите в раздел 'Кошелёк' → 'Пополнить' для выбора способа пополнения.",
    },
    {
      question: "Какие комиссии взимаются?",
      answer: "Комиссии зависят от типа операции и объёма торговли. Maker комиссия от 0% до 0.28%, Taker комиссия от 0.20% до 0.38%. Пополнение бесплатное, вывод зависит от валюты и сети. Подробную информацию можно найти на странице 'Комиссии'.",
    },
    {
      question: "Как обеспечена безопасность?",
      answer: "ATAIX Eurasia использует современные методы защиты, включая двухфакторную аутентификацию (2FA), холодное хранение активов, лицензию AFSA и регулярные аудиты безопасности.",
    },
    {
      question: "Поддерживается ли мобильное приложение?",
      answer: "Да, доступны мобильные приложения для iOS и Android. Скачать можно в App Store, Google Play или AppGallery. Приложение предоставляет полный доступ ко всем функциям платформы.",
    },
    {
      question: "Как работает P2P торговля?",
      answer: "P2P торговля позволяет покупать и продавать криптовалюту напрямую другим пользователям. Все сделки защищены системой escrow, которая удерживает средства до подтверждения получения платежа.",
    },
    {
      question: "Можно ли торговать без верификации?",
      answer: "Базовая верификация требуется для торговли. Для увеличения лимитов и доступа к дополнительным функциям может потребоваться расширенная верификация.",
    },
    {
      question: "Как вывести средства?",
      answer: "Перейдите в раздел 'Кошелёк' → 'Вывести', выберите валюту, сумму и адрес кошелька или банковский счёт. Комиссия зависит от выбранной валюты и сети.",
    },
    {
      question: "Что делать, если забыл пароль?",
      answer: "На странице входа нажмите 'Забыли пароль?' и следуйте инструкциям для восстановления доступа. Вам будет отправлена ссылка для сброса пароля на ваш email.",
    },
  ];

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">Часто задаваемые вопросы</h1>
        <p className="text-gray-600 max-w-prose">
          Ответы на популярные вопросы о работе с платформой ATAIX Eurasia.
        </p>
      </div>
      <div className="space-y-3 max-w-4xl">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full p-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
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
              <div className="px-5 pb-5 text-gray-600 animate-fade-in">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
