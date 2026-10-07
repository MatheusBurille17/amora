export async function startCheckout(email: string, giftId: string, idToken?: string | null) {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
    body: JSON.stringify({ email: email.trim().toLowerCase(), giftId }),
  });
  const raw = await response.text();
  let data: {
    error?: string;
    demo?: boolean;
    complimentary?: boolean;
    initPoint?: string | null;
    orderId?: string;
  } = {};
  if (raw) {
    try {
      data = JSON.parse(raw) as typeof data;
    } catch {
      throw new Error("O servidor não respondeu. Tenta de novo.");
    }
  }
  if (!response.ok) throw new Error(data.error || "Falha no pagamento");
  return data;
}
