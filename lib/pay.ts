export async function startCheckout(email: string, giftId: string) {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), giftId }),
  });
  const data = (await response.json()) as {
    error?: string;
    demo?: boolean;
    initPoint?: string | null;
    orderId?: string;
  };
  if (!response.ok) throw new Error(data.error || "Falha no pagamento");
  return data;
}
