export default function FAQPage() {
  const faqs = [
    {
      question: "Как зарегистрироваться на ATAIX Eurasia?",
      answer: "Нажмите кнопку 'Регистрация' в правом верхнем углу, введите email и создайте пароль. После регистрации вам нужно будет пройти верификацию.",
    },
    {
      question: "Какие документы нужны для верификации?",
      answer: "Для полной верификации потребуется паспорт или удостоверение личности, а также подтверждение адреса проживания.",
    },
    {
      question: "Как пополнить счёт?",
      answer: "Вы можете пополнить счёт через партнёрские банки Казахстана, включая Каспий банк и Хоум кредит банк. Перейдите в раздел 'Кошелёк' для пополнения.",
    },
    {
      question: "Какие комиссии взимаются?",
      answer: "Комиссии зависят от типа операции. Подробную информацию о комиссиях можно найти на странице 'Комиссии'.",
    },
    {
      question: "Как обеспечена безопасность?",
      answer: "ATAIX Eurasia использует современные методы защиты, включая 2FA, холодное хранение активов и лицензию AFSA.",
    },
    {
      question: "Поддерживается ли мобильное приложение?",
      answer: "Да, доступны мобильные приложения для iOS и Android. Скачать можно в App Store, Google Play или AppGallery.",
    },
  ];

  return (
    <div className="container py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Часто задаваемые вопросы</h1>
      <p className="text-muted-foreground mb-8 max-w-prose">
        Ответы на популярные вопросы о работе с платформой ATAIX Eurasia.
      </p>
      <div className="space-y-4 max-w-3xl">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-xl border p-6 bg-white">
            <h3 className="font-semibold mb-2">{faq.question}</h3>
            <p className="text-sm text-muted-foreground">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
