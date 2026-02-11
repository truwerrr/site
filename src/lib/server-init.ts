// Автозапуск симулятора при старте сервера
let simulatorStarted = false;

export async function initMarketSimulator() {
  if (simulatorStarted) return;
  
  // Запускаем только в production или если явно указано
  if (process.env.NODE_ENV === "production" || process.env.ENABLE_SIMULATOR === "true") {
    try {
      const { getMarketSimulator } = await import("./market-simulator");
      const simulator = getMarketSimulator();
      await simulator.start();
      simulatorStarted = true;
      console.log("✅ Market simulator started");
    } catch (error) {
      console.error("Failed to start market simulator:", error);
    }
  }
}

// Для ручного запуска через API
export async function startSimulatorManually() {
  try {
    const { getMarketSimulator } = await import("./market-simulator");
    const simulator = getMarketSimulator();
    await simulator.start();
    simulatorStarted = true;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
