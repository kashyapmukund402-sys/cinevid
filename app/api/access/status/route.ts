import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getAccess } from "@/lib/access";
import { PLANS } from "@/lib/plans";
export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ loggedIn: false, tier: "none", expiresAt: null, plans: PLANS });
  const a = await getAccess(userId);
  return NextResponse.json({ loggedIn: true, userId, tier: a.tier, expiresAt: a.expiresAt, plans: PLANS });
}
