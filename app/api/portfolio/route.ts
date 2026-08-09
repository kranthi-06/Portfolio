import { NextResponse } from "next/server";
import { getPortfolioData } from "@/lib/portfolio/data";

export const revalidate = 60;

export async function GET() {
  try {
    const portfolio = await getPortfolioData();
    return NextResponse.json(portfolio, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (err) { console.error(err);
    return NextResponse.json(
      { error: "The portfolio is temporarily unavailable. Please try again." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
