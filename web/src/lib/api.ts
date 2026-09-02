import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { Category, ChatMessage, Profile, Stream } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";

type StreamRow = {
  id: string;
  owner_id: string | null;
  handle: string;
  display_name: string;
  title: string;
  category: string;
  tags: string;
  thumbnail: string;
  portrait: string | null;
  video: string | null;
  avatar: string;
  bio: string;
  status: string;
  viewer_count: number;
  like_count: number;
  follower_count: number;
  started_at: string;
  is_featured: boolean | number | string;
};

function mapStream(row: StreamRow): Stream {
  const featured =
    row.is_featured === true ||
    row.is_featured === 1 ||
    row.is_featured === "t" ||
    row.is_featured === "true";
  const category = (CATEGORIES as readonly string[]).includes(row.category)
    ? (row.category as Category)
    : "music";
  return {
    id: row.id,
    ownerId: row.owner_id,
    handle: row.handle,
    displayName: row.display_name,
    title: row.title,
    category,
    tags: row.tags,
    thumbnail: row.thumbnail,
    portrait: row.portrait,
    video: row.video,
    avatar: row.avatar,
    bio: row.bio,
    status: row.status === "offline" ? "offline" : "live",
    viewerCount: Number(row.viewer_count) || 0,
    likeCount: Number(row.like_count) || 0,
    followerCount: Number(row.follower_count) || 0,
    startedAt: typeof row.started_at === "string" ? row.started_at : new Date(row.started_at).toISOString(),
    isFeatured: featured,
  };
}

export const listStreams = createServerFn({ method: "GET" })
  .validator(z.object({ category: z.enum(["music", "gaming", "talk", "irl", "all"]).optional() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const all = await sql<StreamRow>`
      select id, owner_id, handle, display_name, title, category, tags, thumbnail, portrait, video, avatar, bio,
             status, viewer_count, like_count, follower_count, started_at, is_featured
      from streams
      order by is_featured desc, viewer_count desc, started_at desc
    `;
    const mapped = all.map(mapStream);
    const category = data.category && data.category !== "all" ? data.category : null;
    if (!category) return mapped;
    return mapped.filter((s) => s.category === category);
  });

export const getStream = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<StreamRow>`
      select id, owner_id, handle, display_name, title, category, tags, thumbnail, portrait, video, avatar, bio,
             status, viewer_count, like_count, follower_count, started_at, is_featured
      from streams where id = ${data.id} limit 1
    `;
    return rows[0] ? mapStream(rows[0]) : null;
  });

export const listChat = createServerFn({ method: "GET" })
  .validator(z.object({ streamId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      stream_id: string;
      user_id: string | null;
      author: string;
      body: string;
      created_at: string;
    }>`
      select id, stream_id, user_id, author, body, created_at
      from chat_messages
      where stream_id = ${data.streamId}
      order by created_at desc
      limit 80
    `;
    return rows
      .map(
        (r): ChatMessage => ({
          id: r.id,
          streamId: r.stream_id,
          userId: r.user_id,
          author: r.author,
          body: r.body,
          createdAt: typeof r.created_at === "string" ? r.created_at : new Date(r.created_at).toISOString(),
        }),
      )
      .reverse();
  });

export const postChat = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ streamId: z.string().min(1), body: z.string().min(1).max(240) }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const profiles = await sql<{ display_name: string }>`
      select display_name from profiles where user_id = ${context.userId} limit 1
    `;
    const author = profiles[0]?.display_name ?? "Guest";
    const rows = await sql<{
      id: number;
      stream_id: string;
      user_id: string | null;
      author: string;
      body: string;
      created_at: string;
    }>`
      insert into chat_messages (stream_id, user_id, author, body)
      values (${data.streamId}, ${context.userId}, ${author}, ${data.body.trim()})
      returning id, stream_id, user_id, author, body, created_at
    `;
    const r = rows[0];
    if (!r) throw new Error("Failed to send");
    return {
      id: r.id,
      streamId: r.stream_id,
      userId: r.user_id,
      author: r.author,
      body: r.body,
      createdAt: typeof r.created_at === "string" ? r.created_at : new Date(r.created_at).toISOString(),
    } satisfies ChatMessage;
  });

export const toggleFollow = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ streamId: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const existing = await sql<{ follower_id: string }>`
      select follower_id from follows
      where follower_id = ${context.userId} and stream_id = ${data.streamId}
      limit 1
    `;
    if (existing[0]) {
      await sql`delete from follows where follower_id = ${context.userId} and stream_id = ${data.streamId}`;
      await sql`update streams set follower_count = greatest(follower_count - 1, 0) where id = ${data.streamId}`;
      return { following: false };
    }
    await sql`insert into follows (follower_id, stream_id) values (${context.userId}, ${data.streamId})`;
    await sql`update streams set follower_count = follower_count + 1 where id = ${data.streamId}`;
    return { following: true };
  });

export const listMyFollows = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ stream_id: string }>`
      select stream_id from follows where follower_id = ${context.userId}
    `;
    return rows.map((r) => r.stream_id);
  });

export const toggleLike = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ streamId: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const existing = await sql<{ user_id: string }>`
      select user_id from reactions
      where user_id = ${context.userId} and stream_id = ${data.streamId} and kind = 'like'
      limit 1
    `;
    if (existing[0]) {
      await sql`delete from reactions where user_id = ${context.userId} and stream_id = ${data.streamId} and kind = 'like'`;
      await sql`update streams set like_count = greatest(like_count - 1, 0) where id = ${data.streamId}`;
      return { liked: false };
    }
    await sql`insert into reactions (user_id, stream_id, kind) values (${context.userId}, ${data.streamId}, 'like')`;
    await sql`update streams set like_count = like_count + 1 where id = ${data.streamId}`;
    return { liked: true };
  });

export const sendGift = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ streamId: z.string().min(1), amount: z.number().int().min(1).max(500) }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    await sql`insert into gifts (from_user, stream_id, amount) values (${context.userId}, ${data.streamId}, ${data.amount})`;
    return { ok: true as const, amount: data.amount };
  });

export const ensureProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ displayName: z.string().min(1).max(40) }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const existing = await sql<{ user_id: string; handle: string; display_name: string; bio: string }>`
      select user_id, handle, display_name, bio from profiles where user_id = ${context.userId} limit 1
    `;
    if (existing[0]) {
      return {
        userId: existing[0].user_id,
        handle: existing[0].handle,
        displayName: existing[0].display_name,
        bio: existing[0].bio,
      } satisfies Profile;
    }
    const base =
      data.displayName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "")
        .slice(0, 16) || "creator";
    const handle = `${base}${context.userId.replace(/[^a-z0-9]/gi, "").slice(-4).toLowerCase()}`;
    await sql`
      insert into profiles (user_id, handle, display_name, bio)
      values (${context.userId}, ${handle}, ${data.displayName}, 'Your stage. Your people. Your moment.')
    `;
    return {
      userId: context.userId,
      handle,
      displayName: data.displayName,
      bio: "Your stage. Your people. Your moment.",
    } satisfies Profile;
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ user_id: string; handle: string; display_name: string; bio: string }>`
      select user_id, handle, display_name, bio from profiles where user_id = ${context.userId} limit 1
    `;
    if (!rows[0]) return null;
    return {
      userId: rows[0].user_id,
      handle: rows[0].handle,
      displayName: rows[0].display_name,
      bio: rows[0].bio,
    } satisfies Profile;
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ displayName: z.string().min(1).max(40), bio: z.string().max(180) }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    await sql`
      update profiles set display_name = ${data.displayName}, bio = ${data.bio}
      where user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const startBroadcast = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      title: z.string().min(2).max(80),
      category: z.enum(["music", "gaming", "talk", "irl"]),
      tags: z.string().max(80),
      audience: z.enum(["everyone", "followers"]),
    }),
  )
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const profiles = await sql<{ handle: string; display_name: string; bio: string }>`
      select handle, display_name, bio from profiles where user_id = ${context.userId} limit 1
    `;
    const profile = profiles[0];
    if (!profile) throw new Error("Create your profile first");
    await sql`update streams set status = 'offline' where owner_id = ${context.userId} and status = 'live'`;
    const id = `live-${crypto.randomUUID().slice(0, 8)}`;
    await sql`
      insert into streams (
        id, owner_id, handle, display_name, title, category, tags, thumbnail, portrait, video, avatar, bio,
        status, viewer_count, like_count, follower_count, started_at, is_featured
      ) values (
        ${id}, ${context.userId}, ${profile.handle}, ${profile.display_name}, ${data.title},
        ${data.category}, ${data.tags}, '/media/crowd-wide.jpg', null, null,
        '/media/avatar-nightwave.jpg', ${profile.bio},
        'live', 1, 0, 0, now(), false
      )
    `;
    void data.audience;
    const rows = await sql<StreamRow>`
      select id, owner_id, handle, display_name, title, category, tags, thumbnail, portrait, video, avatar, bio,
             status, viewer_count, like_count, follower_count, started_at, is_featured
      from streams where id = ${id} limit 1
    `;
    if (!rows[0]) throw new Error("Could not start broadcast");
    return mapStream(rows[0]);
  });

export const endBroadcast = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ streamId: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    await sql`update streams set status = 'offline' where id = ${data.streamId} and owner_id = ${context.userId}`;
    return { ok: true as const };
  });

export const listMyStreams = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<StreamRow>`
      select id, owner_id, handle, display_name, title, category, tags, thumbnail, portrait, video, avatar, bio,
             status, viewer_count, like_count, follower_count, started_at, is_featured
      from streams where owner_id = ${context.userId}
      order by started_at desc
    `;
    return rows.map(mapStream);
  });

