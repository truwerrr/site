// Endpoint для инициализации симулятора (можно вызвать вручную или автоматически)
import { NextResponse } from "next/server";
import { getMarketSimulator } from "@/lib/market-simulator";

export async function GET() {
  try {
    const simulator = getMarketSimulator();
    const status = await simulator.getStatus();
    
    // Если симулятор не запущен, запускаем его
    if (!status.isRunning) {
      await simulator.start();
      return NextResponse.json({ 
        success: true, 
        message: "Simulator started automatically",
        status: await simulator.getStatus()
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Simulator already running",
      status 
    });
  } catch (error: any) {
    console.error("Init error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to initialize simulator" 
    }, { status: 500 });
  }
}
