import { NextResponse } from "next/server";
import { randomId } from "@/lib/slug";
import { BRAND } from "@/lib/brand";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      giftId?: string;
    };
    const email = String(body.email ?? "").trim().toLowerCase();
    const giftId = String(body.giftId ?? "");
    if (!email || !giftId) {
      return NextResponse.json(
        { error: "E-mail e presente são obrigatórios." },
        { status: 400 },
      );
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
    const orderId = randomId(14);

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return NextResponse.json({
        demo: true,
        orderId,
        message: "Mercado Pago ainda não configurado. Recado liberado em modo local.",
      });
    }

    const { getAdminDb } = await import("@/lib/firebase/admin");
    const db = getAdminDb();
    if (db) {
      const giftSnap = await db.collection("gifts").doc(giftId).get();
      if (!giftSnap.exists) {
        return NextResponse.json({ error: "Presente não encontrado." }, { status: 404 });
      }
      const gift = giftSnap.data() as { paid?: boolean; email?: string };
      if (gift.paid) {
        return NextResponse.json({ error: "Esse recado já foi liberado." }, { status: 409 });
      }
      if (gift.email && gift.email !== email) {
        return NextResponse.json({ error: "Esse presente pertence a outro e-mail." }, { status: 403 });
      }
    }

    const { createGiftPreference } = await import("@/lib/mercadopago");
    const preference = await createGiftPreference({
      orderId,
      giftId,
      email,
      origin,
    });

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
      { error: "Não deu para abrir o pagamento. Tenta de novo." },
      { status: 500 },
    );
  }
}
