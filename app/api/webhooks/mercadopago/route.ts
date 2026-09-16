import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getPayment } from "@/lib/mercadopago";
import { toPublicGift, withoutPhotoBytes } from "@/lib/gift";
import type { Gift, GiftPhoto } from "@/lib/types";

async function markPaid(paymentId: string) {
  const payment = await getPayment(paymentId);
  if (!payment || payment.status !== "approved") return;
  const db = getAdminDb();
  if (!db) return;

  const orderId =
    String(payment.external_reference ?? payment.metadata?.order_id ?? "");
  const giftId = String(payment.metadata?.gift_id ?? "");
  if (orderId) {
    await db.collection("orders").doc(orderId).set(
      {
        status: "approved",
        paymentId: String(payment.id),
        paidAt: new Date().toISOString(),
      },
      { merge: true },
    );
  }
  if (!giftId) return;
  const giftRef = db.collection("gifts").doc(giftId);
  const snap = await giftRef.get();
  if (!snap.exists) return;
  const gift = snap.data() as Gift;
  const photoSnap = await giftRef.collection("photos").get();
  const photos = photoSnap.docs
    .map((item) => item.data() as GiftPhoto & { order?: number })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(({ id, src, caption }) => ({ id, src, caption }));

  const published = withoutPhotoBytes({
    ...gift,
    photos,
    paid: true,
    status: "published" as const,
    publishedAt: gift.publishedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await giftRef.set(published, { merge: true });
  const pageRef = db.collection("pages").doc(published.slug);
  await pageRef.set(toPublicGift(published), { merge: true });
  await Promise.all(
    photoSnap.docs.map((item) => pageRef.collection("photos").doc(item.id).set(item.data())),
  );
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const body = await request.text();
  let paymentId = url.searchParams.get("data.id") ?? url.searchParams.get("id");
  if (!paymentId && body) {
    try {
      const json = JSON.parse(body) as { data?: { id?: string }; id?: string };
      paymentId = json.data?.id ?? json.id ?? null;
    } catch {
      const params = new URLSearchParams(body);
      paymentId = params.get("data.id") ?? params.get("id");
    }
  }
  if (paymentId) await markPaid(paymentId);
  return NextResponse.json({ received: true });
}

export async function GET(request: Request) {
  return POST(request);
}
