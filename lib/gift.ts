import type { Gift } from "@/lib/types";
import { emptyAnswers } from "@/lib/questions";
import { randomId } from "@/lib/slug";

export const MAX_GIFT_PHOTOS = 12;

export function createDraft(partial?: Partial<Gift>): Gift {
  const now = new Date().toISOString();
  return {
    id: randomId(12),
    slug: randomId(8),
    ownerUid: null,
    email: "",
    status: "draft",
    paid: false,
    authorName: "",
    recipientName: "",
    startDate: "",
    youtubeUrl: "",
    photos: [],
    answers: emptyAnswers(),
    letter: "",
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
    ...partial,
  };
}

export function toPublicGift(gift: Gift) {
  return {
    id: gift.id,
    slug: gift.slug,
    status: gift.status,
    authorName: gift.authorName,
    recipientName: gift.recipientName,
    startDate: gift.startDate,
    youtubeUrl: gift.youtubeUrl,
    photos: gift.photos,
    answers: gift.answers,
    letter: gift.letter,
    createdAt: gift.createdAt,
    updatedAt: gift.updatedAt,
    publishedAt: gift.publishedAt,
  };
}

export function withoutPhotoBytes<T extends { photos: Gift["photos"] }>(gift: T) {
  return {
    ...gift,
    photos: gift.photos.map((photo) => ({
      id: photo.id,
      caption: photo.caption,
      src: "",
    })),
  };
}

export function isGiftComplete(gift: Gift) {
  return Boolean(
    gift.authorName.trim() &&
      gift.recipientName.trim() &&
      gift.startDate &&
      gift.photos.length > 0 &&
      gift.letter.trim(),
  );
}
