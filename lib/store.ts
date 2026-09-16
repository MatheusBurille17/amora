import type { Gift } from "@/lib/types";
import { createDraft } from "@/lib/gift";

const DRAFT_KEY = "amora.draft";
const GIFTS_KEY = "amora.gifts";
const SESSION_KEY = "amora.session";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function loadDraft(): Gift {
  if (!canUseStorage()) return createDraft();
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return createDraft();
  try {
    return { ...createDraft(), ...JSON.parse(raw) };
  } catch {
    return createDraft();
  }
}

export function saveDraft(gift: Gift) {
  if (!canUseStorage()) return gift;
  const next = { ...gift, updatedAt: new Date().toISOString() };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
  return next;
}

export function clearDraft() {
  if (!canUseStorage()) return;
  localStorage.removeItem(DRAFT_KEY);
}

export function listLocalGifts(): Gift[] {
  if (!canUseStorage()) return [];
  try {
    return JSON.parse(localStorage.getItem(GIFTS_KEY) ?? "[]") as Gift[];
  } catch {
    return [];
  }
}

export function upsertLocalGift(gift: Gift) {
  const gifts = listLocalGifts().filter((item) => item.id !== gift.id);
  gifts.unshift(gift);
  localStorage.setItem(GIFTS_KEY, JSON.stringify(gifts));
  return gift;
}

export function getLocalGiftBySlug(slug: string) {
  return listLocalGifts().find((gift) => gift.slug === slug) ?? null;
}

export function getLocalGiftById(id: string) {
  return listLocalGifts().find((gift) => gift.id === id) ?? null;
}

export function getSessionEmail() {
  if (!canUseStorage()) return "";
  return localStorage.getItem(SESSION_KEY) ?? "";
}

export function setSessionEmail(email: string) {
  if (!canUseStorage()) return;
  localStorage.setItem(SESSION_KEY, email);
}
