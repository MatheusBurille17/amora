import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { DEMO_GIFT } from "@/lib/demo";
import type { GiftPhoto } from "@/lib/types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  if (slug === "ensaio") {
    return NextResponse.json({ gift: DEMO_GIFT });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const pageRef = db.collection("pages").doc(slug);
  const snap = await pageRef.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const photoSnap = await pageRef.collection("photos").get();
  const photos = photoSnap.docs
    .map((item) => item.data() as GiftPhoto & { order?: number })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(({ id, src, caption }) => ({ id, src, caption }));

  return NextResponse.json({ gift: { ...snap.data(), photos } });
}
