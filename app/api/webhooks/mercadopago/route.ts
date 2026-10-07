import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { publishGiftAdmin } from "@/lib/firebase/publish";
import { getPayment } from "@/lib/mercadopago";

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
  await publishGiftAdmin(giftId);
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
