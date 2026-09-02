create table if not exists streams (
  id              text primary key,
  owner_id        text,
  handle          text not null,
  display_name    text not null,
  title           text not null,
  category        text not null,
  tags            text not null default '',
  thumbnail       text not null,
  portrait        text,
  video           text,
  avatar          text not null,
  bio             text not null default '',
  status          text not null default 'live',
  viewer_count    integer not null default 0,
  like_count      integer not null default 0,
  follower_count  integer not null default 0,
  started_at      timestamptz not null default now(),
  is_featured     boolean not null default false
);

create index if not exists streams_status_idx on streams (status);
create index if not exists streams_category_idx on streams (category);
create index if not exists streams_owner_idx on streams (owner_id);

create table if not exists chat_messages (
  id          serial primary key,
  stream_id   text not null references streams(id) on delete cascade,
  user_id     text,
  author      text not null,
  body        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists chat_stream_idx on chat_messages (stream_id, created_at);

create table if not exists follows (
  follower_id  text not null,
  stream_id    text not null,
  created_at   timestamptz not null default now(),
  primary key (follower_id, stream_id)
);

create table if not exists reactions (
  user_id     text not null,
  stream_id   text not null,
  kind        text not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, stream_id, kind)
);

create table if not exists profiles (
  user_id       text primary key,
  handle        text unique not null,
  display_name  text not null,
  bio           text not null default '',
  created_at    timestamptz not null default now()
);

create table if not exists gifts (
  id          serial primary key,
  from_user   text not null,
  stream_id   text not null,
  amount      integer not null,
  created_at  timestamptz not null default now()
);

insert into streams (
  id, owner_id, handle, display_name, title, category, tags, thumbnail, portrait, video, avatar, bio,
  status, viewer_count, like_count, follower_count, started_at, is_featured
) values
  ('nightwave', null, 'djnightwave', 'DJ Nightwave', 'Electric Pulse', 'music', 'electronic,live set',
   '/media/nightwave.jpg', '/media/nightwave-portrait.jpg', '/media/nightwave.mp4', '/media/avatar-nightwave.jpg',
   'Midnight frequencies. No gatekeepers — just the drop.', 'live', 12400, 3180, 88200, now() - interval '2 hours 12 minutes', true),
  ('soulful', null, 'soulfulstrings', 'Soulful Strings', 'Late Night Acoustic', 'music', 'acoustic,chill',
   '/media/soulful.jpg', null, null, '/media/soulful.jpg',
   'Songs for the 2am crowd. Bring your quiet.', 'live', 4310, 980, 22100, now() - interval '54 minutes', true),
  ('echoflow', null, 'echoflow', 'EchoFlow', 'Warehouse nights, no setlist', 'music', 'house,techno',
   '/media/echoflow.jpg', null, null, '/media/avatar-echo.jpg',
   'Four-on-the-floor until sunrise.', 'live', 8760, 2104, 54010, now() - interval '1 hour 20 minutes', true),
  ('lunastar', null, 'lunastar', 'LunaStar', 'Ranked grind. No cam, all aim.', 'gaming', 'fps,ranked',
   '/media/lunastar.jpg', null, null, '/media/avatar-luna.jpg',
   'Climbing with lo-fi in the background.', 'live', 6920, 1540, 41002, now() - interval '3 hours', false),
  ('arcade', null, 'arcadeking', 'ArcadeKing', 'FT10s until we drop', 'gaming', 'fighter,arcade',
   '/media/arcade.jpg', null, null, '/media/arcade.jpg',
   'Old sticks, new rivals.', 'live', 2180, 640, 9800, now() - interval '38 minutes', false),
  ('nightowl', null, 'nightowl', 'NightOwl', 'Unfiltered after dark', 'talk', 'late night,community',
   '/media/nightowl.jpg', null, null, '/media/avatar-owl.jpg',
   'Come talk. Stay a while.', 'live', 3540, 890, 27650, now() - interval '1 hour 5 minutes', false),
  ('beatmaker', null, 'beatmaker', 'BeatMaker', 'Live mix and master', 'music', 'producer,studio',
   '/media/beatmaker.jpg', null, null, '/media/beatmaker.jpg',
   'Open session. Steal my chain if you can hear it.', 'live', 1890, 410, 15440, now() - interval '22 minutes', false),
  ('jazz', null, 'velvetkeys', 'Velvet Keys', 'Violet Hour jazz set', 'music', 'jazz,live',
   '/media/jazz.jpg', null, null, '/media/jazz.jpg',
   'Sax, smoke, and a slow tempo.', 'live', 980, 220, 6120, now() - interval '11 minutes', false),
  ('novairl', null, 'novawalks', 'Nova Walks', 'City night walk — no script', 'irl', 'city,night',
   '/media/nova-irl.jpg', null, null, '/media/nova-irl.jpg',
   'Wherever the lights take us.', 'live', 2740, 560, 19880, now() - interval '47 minutes', false),
  ('velvetmic', null, 'velvetmic', 'Velvet Mic', 'Open mic, first timers welcome', 'talk', 'open mic,music',
   '/media/velvetmic.jpg', null, null, '/media/velvetmic.jpg',
   'Your stage. Your people. Your moment.', 'live', 640, 120, 3340, now() - interval '8 minutes', false);

insert into chat_messages (stream_id, user_id, author, body, created_at) values
  ('nightwave', null, 'LunaStar', 'This drop is insane', now() - interval '4 minutes'),
  ('nightwave', null, 'BeatMaker', 'The mix though', now() - interval '3 minutes'),
  ('nightwave', null, 'EchoFlow', 'Play the unreleased one', now() - interval '2 minutes'),
  ('nightwave', null, 'NightOwl', 'Love this vibe', now() - interval '90 seconds'),
  ('echoflow', null, 'DJ Nightwave', 'Warehouse is shaking', now() - interval '2 minutes'),
  ('soulful', null, 'Velvet Mic', 'That voicing is beautiful', now() - interval '1 minute'),
  ('lunastar', null, 'ArcadeKing', 'Clutch. Again.', now() - interval '50 seconds'),
  ('nightowl', null, 'Nova Walks', 'Needed this conversation tonight', now() - interval '40 seconds');
