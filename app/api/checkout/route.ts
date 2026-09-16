import { NextResponse } from "next/server";
import { randomId } from "@/lib/slug";
import { createGiftPreference, mpEnabled } from "@/lib/mercadopago";
import { getAdminDb } from "@/lib/firebase/admin";
import { BRAND } from "@/lib/brand";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const giftId = String(body.giftId ?? "");
  if (!email || !giftId) {
    return NextResponse.json({ error: "E-mail e presente são obrigatórios." }, { status: 400 });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const orderId = randomId(14);

  if (!mpEnabled) {
    return NextResponse.json({
      demo: true,
      orderId,
      message: "Mercado Pago ainda não configurado. Recado liberado em modo local.",
    });
  }

  try {
    const preference = await createGiftPreference({
      orderId,
      giftId,
      email,
      origin,
    });

    const db = getAdminDb();
    if (db) {
      await db.collection("orders").doc(orderId).set({
        id: orderId,
        uid: null,
        email,
        giftId,
        status: "pending",
        amount: BRAND.price,
        preferenceId: preference?.id ?? null,
        paymentId: null,
        createdAt: new Date().toISOString(),
        paidAt: null,
      });
    }

    return NextResponse.json({
      demo: false,
      orderId,
      preferenceId: preference?.id ?? null,
      initPoint: preference?.init_point ?? preference?.sandbox_init_point ?? null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não deu para abrir o Mercado Pago. Confere as credenciais." },
      { status: 500 },
    );
  }
}
