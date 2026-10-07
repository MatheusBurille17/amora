import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { Gift, GiftPhoto } from "@/lib/types";
import { toPublicGift } from "@/lib/gift";

type PhotoDoc = GiftPhoto & { order: number };

function clip(value: string, max: number) {
  return value.slice(0, max);
}

function sanitizeGiftPayload(gift: Gift, uid: string): Gift {
  const now = new Date().toISOString();
  return {
    id: clip(gift.id, 40),
    slug: clip(gift.slug, 40),
    ownerUid: uid,
    email: gift.email.trim().toLowerCase().slice(0, 120),
    status: gift.status === "published" ? "published" : "draft",
    paid: Boolean(gift.paid),
    authorName: clip(gift.authorName, 80),
    recipientName: clip(gift.recipientName, 80),
    startDate: clip(gift.startDate, 20),
    youtubeUrl: clip(gift.youtubeUrl, 300),
    photos: gift.photos.slice(0, 7).map((photo) => ({
      id: clip(photo.id, 40),
      caption: clip(photo.caption, 180),
      src: "",
    })),
    answers: gift.answers.slice(0, 4).map((answer) => ({
      id: clip(answer.id, 40),
      text: clip(answer.text, 4000),
      photoId: clip(answer.photoId ?? "", 40),
    })),
    letter: clip(gift.letter, 8000),
    createdAt: gift.createdAt || now,
    updatedAt: now,
    publishedAt: gift.publishedAt,
  };
}

async function writePhotos(
  path: [string, string, string],
  photos: GiftPhoto[],
) {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase não configurado");
  await Promise.all(
    photos.slice(0, 7).map((photo, order) =>
      setDoc(doc(db, path[0], path[1], path[2], clip(photo.id, 40)), {
        id: clip(photo.id, 40),
        src: photo.src.slice(0, 900_000),
        caption: clip(photo.caption, 180),
        order,
      } satisfies PhotoDoc),
    ),
  );
}

async function readPhotos(path: [string, string, string]) {
  const db = getFirebaseDb();
  if (!db) return [];
  const snap = await getDocs(collection(db, path[0], path[1], path[2]));
  return snap.docs
    .map((item) => item.data() as PhotoDoc)
    .sort((a, b) => a.order - b.order)
    .map(({ id, src, caption }) => ({ id, src, caption }));
}

export async function saveGiftRemote(gift: Gift, uid: string) {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase não configurado");

  const payload = sanitizeGiftPayload(gift, uid);

  await setDoc(doc(db, "gifts", gift.id), payload, { merge: true });
  await writePhotos(["gifts", gift.id, "photos"], gift.photos);

  return { ...payload, photos: gift.photos };
}

export async function getGiftRemote(id: string) {
  const db = getFirebaseDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, "gifts", id));
  if (!snap.exists()) return null;
  const gift = snap.data() as Gift;
  return { ...gift, photos: await readPhotos(["gifts", id, "photos"]) };
}

export async function listGiftsRemote(uid: string) {
  const db = getFirebaseDb();
  if (!db) return [];
  const snap = await getDocs(query(collection(db, "gifts"), where("ownerUid", "==", uid)));
  return Promise.all(
    snap.docs.map(async (item) => {
      const gift = item.data() as Gift;
      return { ...gift, photos: await readPhotos(["gifts", gift.id, "photos"]) };
    }),
  );
}

export async function getPageBySlug(slug: string) {
  const db = getFirebaseDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, "pages", slug));
  if (!snap.exists()) return null;
  const page = snap.data() as ReturnType<typeof toPublicGift>;
  return { ...page, photos: await readPhotos(["pages", slug, "photos"]) };
}
