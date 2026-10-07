import { getAdminDb } from "@/lib/firebase/admin";
import { toPublicGift, withoutPhotoBytes } from "@/lib/gift";
import type { Gift, GiftPhoto } from "@/lib/types";

export async function publishGiftAdmin(giftId: string) {
  const db = getAdminDb();
  if (!db) return null;

  const giftRef = db.collection("gifts").doc(giftId);
  const snap = await giftRef.get();
  if (!snap.exists) return null;

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

  return published;
}
