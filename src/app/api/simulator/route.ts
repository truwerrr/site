import { NextResponse } from "next/server";
import { getMarketSimulator } from "@/lib/market-simulator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    const simulator = getMarketSimulator();

    if (action === "start") {
      await simulator.start();
      return NextResponse.json({ success: true, message: "Simulator started", isRunning: true });
    } else if (action === "stop") {
      await simulator.stop();
      return NextResponse.json({ success: true, message: "Simulator stopped", isRunning: false });
    } else if (action === "status") {
      const status = await simulator.getStatus();
      return NextResponse.json(status);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Simulator error:", error);
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const simulator = getMarketSimulator();
    const status = await simulator.getStatus();
    return NextResponse.json(status);
  } catch (error: any) {
    console.error("Simulator error:", error);
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
