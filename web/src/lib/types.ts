export const CATEGORIES = ["music", "gaming", "talk", "irl"] as const;
export type Category = (typeof CATEGORIES)[number];
export type StreamStatus = "live" | "offline";

export type Stream = {
  id: string;
  ownerId: string | null;
  handle: string;
  displayName: string;
  title: string;
  category: Category;
  tags: string;
  thumbnail: string;
  portrait: string | null;
  video: string | null;
  avatar: string;
  bio: string;
  status: StreamStatus;
  viewerCount: number;
  likeCount: number;
  followerCount: number;
  startedAt: string;
  isFeatured: boolean;
};

export type ChatMessage = {
  id: number | string;
  streamId: string;
  userId: string | null;
  author: string;
  body: string;
  createdAt: string;
};

export type Profile = {
  userId: string;
  handle: string;
  displayName: string;
  bio: string;
};
