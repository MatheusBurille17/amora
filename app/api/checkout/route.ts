import { NextResponse } from "next/server";
import { randomId } from "@/lib/slug";
import { BRAND } from "@/lib/brand";
import { isComplimentaryEmail } from "@/lib/complimentary";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { publishGiftAdmin } from "@/lib/firebase/publish";

async function releaseComplimentaryGift(request: Request, email: string, giftId: string) {
  const auth = getAdminAuth();
  const db = getAdminDb();
  if (!auth || !db) return null;

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  if (!token) {
    return NextResponse.json({ error: "Entra na sua conta para liberar o recado." }, { status: 401 });
  }

  let decoded;
  try {
    decoded = await auth.verifyIdToken(token);
  } catch {
    return NextResponse.json({ error: "Sua sessão expirou. Entra de novo." }, { status: 401 });
  }
  const tokenEmail = decoded.email?.toLowerCase() ?? "";
  if (!isComplimentaryEmail(tokenEmail) || tokenEmail !== email) {
    return NextResponse.json({ error: "Essa conta não libera sem pagamento." }, { status: 403 });
  }

  const giftSnap = await db.collection("gifts").doc(giftId).get();
  if (!giftSnap.exists) {
    return NextResponse.json({ error: "Presente não encontrado." }, { status: 404 });
  }
  const gift = giftSnap.data() as { paid?: boolean; email?: string; ownerUid?: string | null };
  if (gift.paid) {
    return NextResponse.json({ complimentary: true, alreadyPaid: true });
  }
  if (gift.email && gift.email !== email) {
    return NextResponse.json({ error: "Esse presente pertence a outro e-mail." }, { status: 403 });
  }
  if (gift.ownerUid && gift.ownerUid !== decoded.uid) {
    return NextResponse.json({ error: "Esse presente pertence a outra conta." }, { status: 403 });
  }

  const published = await publishGiftAdmin(giftId);
  if (!published) {
    return NextResponse.json({ error: "Não deu para liberar o recado." }, { status: 500 });
  }

  const orderId = randomId(14);
  await db.collection("orders").doc(orderId).set({
    id: orderId,
    uid: decoded.uid,
    email,
    giftId,
    status: "approved",
    amount: 0,
    preferenceId: null,
    paymentId: null,
    createdAt: new Date().toISOString(),
    paidAt: new Date().toISOString(),
  });

  return NextResponse.json({ complimentary: true, demo: false });
}

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
    const db = getAdminDb();

    if (isComplimentaryEmail(email)) {
      const released = await releaseComplimentaryGift(request, email, giftId);
      if (released) return released;
      if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
        return NextResponse.json(
          { error: "Não deu para liberar essa conta agora. Tenta de novo." },
          { status: 503 },
        );
      }
    }

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return NextResponse.json({
        demo: true,
        orderId,
        message: "Mercado Pago ainda não configurado. Recado liberado em modo local.",
      });
    }

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
