import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { BRAND } from "@/lib/brand";

export const mpEnabled = Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);

export function getMpClient() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) return null;
  return new MercadoPagoConfig({ accessToken: token });
}

export async function createGiftPreference(input: {
  orderId: string;
  giftId: string;
  email: string;
  origin: string;
}) {
  const client = getMpClient();
  if (!client) return null;

  const preference = new Preference(client);
  const created = await preference.create({
    body: {
      external_reference: input.orderId,
      statement_descriptor: "AMORA",
      metadata: {
        order_id: input.orderId,
        gift_id: input.giftId,
      },
      payer: { email: input.email },
      items: [
        {
          id: "amora-vitalicio",
          title: `${BRAND.product} · acesso vitalício`,
          description: "Página do casal com fotos, música, recado e QR Code. Fica no ar para sempre.",
          quantity: 1,
          unit_price: BRAND.price,
          currency_id: "BRL",
          category_id: "digital_goods",
        },
      ],
      payment_methods: {
        installments: 1,
      },
      auto_return: "approved",
      back_urls: {
        success: `${input.origin}/obrigado?order=${input.orderId}`,
        failure: `${input.origin}/criar?pagamento=falhou`,
        pending: `${input.origin}/obrigado?order=${input.orderId}&pending=1`,
      },
      ...(input.origin.startsWith("https://")
        ? { notification_url: `${input.origin}/api/webhooks/mercadopago` }
        : {}),
    },
  });

  return created;
}

export async function getPayment(paymentId: string) {
  const client = getMpClient();
  if (!client) return null;
  return new Payment(client).get({ id: paymentId });
}
