export async function startCheckout(email: string, giftId: string, idToken?: string | null) {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
    body: JSON.stringify({ email: email.trim().toLowerCase(), giftId }),
  });
  const data = (await response.json()) as {
    error?: string;
    demo?: boolean;
    complimentary?: boolean;
    initPoint?: string | null;
    orderId?: string;
  };
  if (!response.ok) throw new Error(data.error || "Falha no pagamento");
  return data;
}
