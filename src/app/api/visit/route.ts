import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }); // returns YYYY-MM-DD
    
    // Increment today's visit count
    await prisma.visitorStat.upsert({
      where: { date: today },
      update: { count: { increment: 1 } },
      create: { date: today, count: 1 }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Visitor tracking error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET() {
  try {
    const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
    
    // Get today's stats
    const todayStat = await prisma.visitorStat.findUnique({
      where: { date: today }
    });

    // Get total stats
    const totalStat = await prisma.visitorStat.aggregate({
      _sum: {
        count: true
      }
    });

    return NextResponse.json({
      success: true,
      today: todayStat?.count || 0,
      total: totalStat._sum.count || 0
    });
  } catch (error) {
    console.error("Failed to get visitor stats:", error);
    return NextResponse.json({ success: false, today: 0, total: 0 });
  }
}
