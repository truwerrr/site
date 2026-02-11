import { NextResponse } from "next/server";
import { getRates } from "@/lib/fetch-rates";

export async function GET() {
  try {
    const rates = await getRates();
    return NextResponse.json(rates);
  } catch (e) {
    console.error("Rates API error:", e);
    return NextResponse.json({ error: "Не удалось загрузить курсы" }, { status: 500 });
  }
}
