import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const pool = getPool();
    await pool.query("SELECT 1");

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Healthcheck failed:", error);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
