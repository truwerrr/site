const ExcelJS = require("exceljs");
const path = require("path");

const reportPath = path.join(__dirname, "..", "deploy", "Отчёт-ataix-биржа.xlsx");

const sections = [
  { name: "Главная и маркетплейс", pct: 100, features: ["Лендинг: герой, тикер, виджет обмена", "Маркет (пары), валюты, правила, комиссии", "Виджет для встраивания"] },
  { name: "Регистрация и безопасность", pct: 100, features: ["Регистрация, вход (NextAuth)", "2FA (TOTP): включение/отключение", "Смена пароля, выход из всех сессий", "Роли: user, admin"] },
  { name: "Спотовая торговля", pct: 100, features: ["Торговая страница: стакан, сделки, график", "Ордера: лимит, маркет, стоп, стоп-лимит", "Движок: матчинг, комиссии (maker 0.1%, taker 0.2%)", "Синхронизация цен (KZT/USDT и др.)"] },
  { name: "Кошелёк", pct: 100, features: ["Балансы (доступно / в ордерах)", "История операций, фильтры", "Вывод средств", "Экспорт истории"] },
  { name: "Профиль", pct: 100, features: ["Обзор: балансы, ордера, исполнения", "Настройки (язык, уведомления)", "Банковские счета", "2FA в профиле"] },
  { name: "P2P", pct: 100, features: ["Объявления: создание, редактирование", "Сделки с эскроу, таймер оплаты", "Чат в сделке (обновление в реальном времени)", "Статусы: оплата → освобождение / отмена / диспут", "Демо-боты для теста"] },
  { name: "Админ-панель", pct: 100, features: ["Сводка: пользователи, P2P сделки", "Пользователи: список, балансы", "P2P: все сделки, фильтр по типу (покупка/продажа)"] },
  { name: "Дополнительно", pct: 100, features: ["Уведомления", "Блог (статьи)", "Юр. страницы (условия, конфиденциальность и др.)", "Поддержка, FAQ, партнёрка"] },
];

async function run() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "ataix report";
  wb.created = new Date();

  const wsSummary = wb.addWorksheet("Сводка", { views: [{ state: "frozen", ySplit: 2 }] });
  const wsDetails = wb.addWorksheet("Детали по разделам", { views: [{ state: "frozen", ySplit: 1 }] });

  const headerFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
  const headerFont = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
  const greenFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF22C55E" } };
  const lightGray = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };

  wsSummary.columns = [
    { width: 8 },
    { width: 32 },
    { width: 12 },
    { width: 18 },
    { width: 50 },
  ];

  wsSummary.mergeCells("A1:E1");
  wsSummary.getCell("A1").value = "ОТЧЁТ О ПРОЕКТЕ: КРИПТОБИРЖА ataix-p.kz";
  wsSummary.getCell("A1").font = { bold: true, size: 16 };
  wsSummary.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
  wsSummary.getRow(1).height = 28;
  wsSummary.getRow(2).height = 22;

  wsSummary.getCell("A2").value = "Дата отчёта";
  wsSummary.getCell("B2").value = new Date().toLocaleDateString("ru-RU", { dateStyle: "long" });
  wsSummary.getCell("A2").font = { bold: true };

  wsSummary.getCell("A4").value = "№";
  wsSummary.getCell("B4").value = "Раздел";
  wsSummary.getCell("C4").value = "Готовность %";
  wsSummary.getCell("D4").value = "Визуально";
  wsSummary.getCell("E4").value = "Ключевые функции";
  [wsSummary.getCell("A4"), wsSummary.getCell("B4"), wsSummary.getCell("C4"), wsSummary.getCell("D4"), wsSummary.getCell("E4")].forEach((c) => {
    c.fill = headerFill;
    c.font = headerFont;
    c.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  });
  wsSummary.getRow(4).height = 24;

  sections.forEach((s, i) => {
    const r = 5 + i;
    const barFull = "█".repeat(Math.round(s.pct / 10));
    const barEmpty = "░".repeat(10 - Math.round(s.pct / 10));
    wsSummary.getCell(`A${r}`).value = i + 1;
    wsSummary.getCell(`B${r}`).value = s.name;
    wsSummary.getCell(`C${r}`).value = s.pct;
    wsSummary.getCell(`C${r}`).numFmt = "0%";
    wsSummary.getCell(`C${r}`).alignment = { horizontal: "center" };
    wsSummary.getCell(`D${r}`).value = `${barFull}${barEmpty} ${s.pct}%`;
    wsSummary.getCell(`D${r}`).font = { color: { argb: "FF15803D" } };
    wsSummary.getCell(`E${r}`).value = s.features.join("; ");
    wsSummary.getCell(`E${r}`).alignment = { wrapText: true };
    wsSummary.getCell(`A${r}`).alignment = { horizontal: "center" };
    if (i % 2 === 1) {
      ["A", "B", "C", "D", "E"].forEach((col) => wsSummary.getCell(`${col}${r}`).fill = lightGray);
    }
    wsSummary.getRow(r).height = Math.max(20, s.features.length * 14);
  });

  const totalPct = sections.reduce((a, s) => a + s.pct, 0) / sections.length;
  const footerRow = 5 + sections.length + 1;
  wsSummary.getCell(`A${footerRow}`).value = "Итого (среднее)";
  wsSummary.getCell(`B${footerRow}`).value = "";
  wsSummary.getCell(`C${footerRow}`).value = totalPct / 100;
  wsSummary.getCell(`C${footerRow}`).numFmt = "0%";
  wsSummary.getCell(`D${footerRow}`).value = `█`.repeat(10) + ` ${Math.round(totalPct)}%`;
  wsSummary.getCell(`E${footerRow}`).value = "Все разделы реализованы и работают.";
  ["A", "B", "C", "D", "E"].forEach((col) => {
    const c = wsSummary.getCell(`${col}${footerRow}`);
    c.font = { bold: true };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E7FF" } };
  });
  wsSummary.getRow(footerRow).height = 22;

  wsDetails.columns = [
    { width: 10 },
    { width: 28 },
    { width: 14 },
    { width: 60 },
  ];
  wsDetails.getCell("A1").value = "№";
  wsDetails.getCell("B1").value = "Раздел";
  wsDetails.getCell("C1").value = "Готовность %";
  wsDetails.getCell("D1").value = "Функции";
  ["A1", "B1", "C1", "D1"].forEach((addr) => {
    wsDetails.getCell(addr).fill = headerFill;
    wsDetails.getCell(addr).font = headerFont;
    wsDetails.getCell(addr).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  });
  wsDetails.getRow(1).height = 24;

  let detailRow = 2;
  sections.forEach((s, i) => {
    s.features.forEach((f, j) => {
      wsDetails.getCell(`A${detailRow}`).value = j === 0 ? i + 1 : "";
      wsDetails.getCell(`B${detailRow}`).value = j === 0 ? s.name : "";
      wsDetails.getCell(`C${detailRow}`).value = j === 0 ? s.pct / 100 : "";
      if (j === 0) wsDetails.getCell(`C${detailRow}`).numFmt = "0%";
      wsDetails.getCell(`D${detailRow}`).value = f;
      wsDetails.getCell(`D${detailRow}`).alignment = { wrapText: true };
      if (detailRow % 2 === 0) ["A", "B", "C", "D"].forEach((col) => wsDetails.getCell(`${col}${detailRow}`).fill = lightGray);
      detailRow++;
    });
  });

  const wsTech = wb.addWorksheet("Технологии и итог");
  wsTech.columns = [{ width: 22 }, { width: 50 }];
  wsTech.getCell("A1").value = "Параметр";
  wsTech.getCell("B1").value = "Значение";
  wsTech.getCell("A1").fill = headerFill;
  wsTech.getCell("B1").fill = headerFill;
  wsTech.getCell("A1").font = headerFont;
  wsTech.getCell("B1").font = headerFont;
  const techRows = [
    ["Стек", "Next.js 14, React, TypeScript, Prisma, SQLite, NextAuth"],
    ["Деплой", "Сервер, Nginx, PM2; домен ataix-p.kz"],
    ["Торговый движок", "Лимит/маркет/стоп ордера, комиссии maker 0.1% / taker 0.2%"],
    ["P2P", "Объявления, сделки, эскроу, чат в реальном времени"],
    ["Безопасность", "2FA (TOTP), сессии, роли"],
    ["Итог", "Полнофункциональная биржа: спот + P2P, кошельки, админка, профиль."],
  ];
  techRows.forEach(([k, v], i) => {
    const r = i + 2;
    wsTech.getCell(`A${r}`).value = k;
    wsTech.getCell(`B${r}`).value = v;
    if (k === "Итог") {
      wsTech.getCell(`A${r}`).font = { bold: true };
      wsTech.getCell(`B${r}`).font = { bold: true };
    }
  });

  await wb.xlsx.writeFile(reportPath);
  console.log("Отчёт сохранён:", reportPath);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
