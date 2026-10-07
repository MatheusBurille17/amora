export type GiftStatus = "draft" | "published";
export type OrderStatus = "pending" | "approved" | "rejected" | "refunded";

export type GiftPhoto = {
  id: string;
  src: string;
  caption: string;
};

export type GiftAnswer = {
  id: string;
  text: string;
  photoId: string;
};

export type Gift = {
  id: string;
  slug: string;
  ownerUid: string | null;
  email: string;
  status: GiftStatus;
  paid: boolean;
  authorName: string;
  recipientName: string;
  startDate: string;
  youtubeUrl: string;
  photos: GiftPhoto[];
  answers: GiftAnswer[];
  letter: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type PublicGift = Omit<Gift, "email" | "ownerUid" | "paid">;

export type UserProfile = {
  uid: string;
  email: string;
  createdAt: string;
};

export type Order = {
  id: string;
  uid: string | null;
  email: string;
  giftId: string;
  status: OrderStatus;
  amount: number;
  preferenceId: string | null;
  paymentId: string | null;
  createdAt: string;
  paidAt: string | null;
};
