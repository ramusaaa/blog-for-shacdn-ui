import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        twoFactorEnabled: true,
        twoFactorSecret: true
      }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json({
      enabled: user.twoFactorEnabled,
      setup: !!user.twoFactorSecret
    });
  } catch (error) {
    console.error("[2FA_STATUS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 