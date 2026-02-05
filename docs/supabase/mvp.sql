-- KiwiCar MVP schema + RLS
-- Run in Supabase SQL editor or via Supabase CLI migrations.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  phone text,
  nickname text not null,
  avatar text,
  region text not null default 'Auckland',
  show_phone_on_listings boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plate_number text not null,
  make text not null,
  model text not null,
  variant text,
  year integer not null,
  mileage integer not null,
  price numeric(10, 2) not null,
  price_negotiable boolean default false,
  description text not null,
  ai_description text,
  ai_price_min numeric(10, 2),
  ai_price_max numeric(10, 2),
  ai_price_rec numeric(10, 2),
  fuel_type text not null check (fuel_type in ('petrol', 'diesel', 'hybrid', 'electric')),
  transmission text not null check (transmission in ('auto', 'manual')),
  body_type text,
  color text,
  engine_cc integer,
  region text not null,
  status text default 'active' check (status in ('active', 'sold', 'removed')),
  wof_expiry date,
  rego_expiry date,
  view_count integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_listings_status_created on public.listings(status, created_at);
create index if not exists idx_listings_make_model on public.listings(make, model);
create index if not exists idx_listings_region on public.listings(region);
create index if not exists idx_listings_price on public.listings(price);

create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  url text not null,
  "order" integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.price_history (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  price numeric(10, 2) not null,
  changed_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  price_alert boolean default false,
  target_price numeric(10, 2),
  created_at timestamptz not null default now(),
  unique(user_id, listing_id)
);

create table if not exists public.vehicle_cache (
  plate_number text primary key,
  make text not null,
  model text not null,
  variant text,
  year integer not null,
  first_registered date,
  wof_status text not null,
  wof_expiry date,
  rego_status text not null,
  rego_expiry date,
  odometer_readings jsonb,
  engine_cc integer,
  fuel_type text,
  body_style text,
  color text,
  fetched_at timestamptz not null default now()
);

create index if not exists idx_vehicle_cache_fetched on public.vehicle_cache(fetched_at);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  content text not null,
  is_read boolean default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_sender_receiver on public.messages(sender_id, receiver_id);
create index if not exists idx_messages_receiver_unread on public.messages(receiver_id, is_read);

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.price_history enable row level security;
alter table public.favorites enable row level security;
alter table public.vehicle_cache enable row level security;
alter table public.messages enable row level security;

-- Profiles
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- Listings
create policy "Listings are viewable when active"
  on public.listings for select
  using (status = 'active' or auth.uid() = user_id);

create policy "Listings are insertable by owner"
  on public.listings for insert
  with check (auth.uid() = user_id);

create policy "Listings are updatable by owner"
  on public.listings for update
  using (auth.uid() = user_id);

create policy "Listings are deletable by owner"
  on public.listings for delete
  using (auth.uid() = user_id);

-- Listing images
create policy "Listing images are viewable with listing"
  on public.listing_images for select
  using (
    exists (
      select 1
      from public.listings
      where public.listings.id = listing_images.listing_id
        and (public.listings.status = 'active' or public.listings.user_id = auth.uid())
    )
  );

create policy "Listing images are insertable by listing owner"
  on public.listing_images for insert
  with check (
    exists (
      select 1
      from public.listings
      where public.listings.id = listing_images.listing_id
        and public.listings.user_id = auth.uid()
    )
  );

create policy "Listing images are updatable by listing owner"
  on public.listing_images for update
  using (
    exists (
      select 1
      from public.listings
      where public.listings.id = listing_images.listing_id
        and public.listings.user_id = auth.uid()
    )
  );

create policy "Listing images are deletable by listing owner"
  on public.listing_images for delete
  using (
    exists (
      select 1
      from public.listings
      where public.listings.id = listing_images.listing_id
        and public.listings.user_id = auth.uid()
    )
  );

-- Price history
create policy "Price history is viewable with listing"
  on public.price_history for select
  using (
    exists (
      select 1
      from public.listings
      where public.listings.id = price_history.listing_id
        and (public.listings.status = 'active' or public.listings.user_id = auth.uid())
    )
  );

create policy "Price history is insertable by listing owner"
  on public.price_history for insert
  with check (
    exists (
      select 1
      from public.listings
      where public.listings.id = price_history.listing_id
        and public.listings.user_id = auth.uid()
    )
  );

-- Favorites
create policy "Favorites are viewable by owner"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Favorites are insertable by owner"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Favorites are updatable by owner"
  on public.favorites for update
  using (auth.uid() = user_id);

create policy "Favorites are deletable by owner"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- Vehicle cache (read-only for clients)
create policy "Vehicle cache is viewable by anyone"
  on public.vehicle_cache for select
  using (true);

-- Messages (P1)
create policy "Messages are viewable by participants"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Messages are insertable by sender"
  on public.messages for insert
  with check (auth.uid() = sender_id);
