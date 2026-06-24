-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users manage own profile"
  on public.profiles for all
  using (auth.uid() = id);

-- ============================================
-- CATEGORIES
-- ============================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null check (char_length(name) <= 50),
  color text not null default '#f97316',
  icon text not null default 'list',
  cover_image_url text,
  is_system boolean default false,
  is_archived boolean default false,
  sort_order integer default 0,
  ultimate_vision text,
  my_roles text,
  ultimate_purpose text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.categories enable row level security;
create policy "Users manage own categories"
  on public.categories for all
  using (auth.uid() = user_id);

-- ============================================
-- GOAL HORIZONS
-- ============================================
create table public.goal_horizons (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete cascade not null,
  label text not null,
  timeframe_type text not null default 'custom',
  content text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.goal_horizons enable row level security;
create policy "Users manage own goal horizons"
  on public.goal_horizons for all
  using (
    exists (
      select 1 from public.categories
      where id = goal_horizons.category_id and user_id = auth.uid()
    )
  );

-- ============================================
-- MICRO GOALS
-- ============================================
create table public.micro_goals (
  id uuid primary key default gen_random_uuid(),
  horizon_id uuid references public.goal_horizons(id) on delete cascade not null,
  title text not null,
  is_complete boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.micro_goals enable row level security;
create policy "Users manage own micro goals"
  on public.micro_goals for all
  using (
    exists (
      select 1 from public.goal_horizons gh
      join public.categories c on c.id = gh.category_id
      where gh.id = micro_goals.horizon_id and c.user_id = auth.uid()
    )
  );

-- ============================================
-- PROJECTS
-- ============================================
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  ultimate_result text,
  ultimate_purpose text,
  cover_image_url text,
  is_archived boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.projects enable row level security;
create policy "Users manage own projects"
  on public.projects for all
  using (auth.uid() = user_id);

-- ============================================
-- INSPIRATION IMAGES
-- ============================================
create table public.inspiration_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  image_url text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.inspiration_images enable row level security;
create policy "Users manage own inspiration images"
  on public.inspiration_images for all
  using (
    exists (
      select 1 from public.projects
      where id = inspiration_images.project_id and user_id = auth.uid()
    )
  );

-- ============================================
-- KEY RESULTS
-- ============================================
create table public.key_results (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  due_date date,
  is_starred boolean default false,
  is_complete boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.key_results enable row level security;
create policy "Users manage own key results"
  on public.key_results for all
  using (
    exists (
      select 1 from public.projects
      where id = key_results.project_id and user_id = auth.uid()
    )
  );

-- ============================================
-- RPM BLOCKS
-- ============================================
create table public.rpm_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  name text,
  result text,
  purpose text,
  is_complete boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.rpm_blocks enable row level security;
create policy "Users manage own rpm blocks"
  on public.rpm_blocks for all
  using (auth.uid() = user_id);

-- ============================================
-- ACTIONS
-- ============================================
create table public.actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  block_id uuid references public.rpm_blocks(id) on delete set null,
  key_result_id uuid references public.key_results(id) on delete set null,
  title text not null,
  notes text,
  estimated_minutes integer default 5,
  is_starred boolean default false,
  is_complete boolean default false,
  is_recurring boolean default false,
  recurrence_rule text,
  week_start date,
  planned_date date,
  planned_time time,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.actions enable row level security;
create policy "Users manage own actions"
  on public.actions for all
  using (auth.uid() = user_id);

-- ============================================
-- WEEKS
-- ============================================
create table public.weeks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  week_start date not null,
  is_complete boolean default false,
  reflection_text text,
  unique(user_id, week_start)
);

alter table public.weeks enable row level security;
create policy "Users manage own weeks"
  on public.weeks for all
  using (auth.uid() = user_id);

-- ============================================
-- PEOPLE
-- ============================================
create table public.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  photo_url text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.people enable row level security;
create policy "Users manage own people"
  on public.people for all
  using (auth.uid() = user_id);

-- ============================================
-- PERSON NOTES
-- ============================================
create table public.person_notes (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references public.people(id) on delete cascade not null,
  note_type text not null default 'general',
  content text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.person_notes enable row level security;
create policy "Users manage own person notes"
  on public.person_notes for all
  using (
    exists (
      select 1 from public.people
      where id = person_notes.person_id and user_id = auth.uid()
    )
  );

-- ============================================
-- CALENDAR INTEGRATIONS
-- ============================================
create table public.calendar_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  provider text not null check (provider in ('google', 'outlook')),
  access_token text,
  refresh_token text,
  token_expiry timestamptz,
  calendar_id text,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.calendar_integrations enable row level security;
create policy "Users manage own calendar integrations"
  on public.calendar_integrations for all
  using (auth.uid() = user_id);

-- ============================================
-- NEW USER TRIGGER
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');

  insert into public.categories (user_id, name, color, icon, is_system, sort_order)
  values (new.id, 'Capture', '#94a3b8', 'inbox', true, 0);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger categories_updated_at before update on public.categories
  for each row execute procedure public.handle_updated_at();

create trigger projects_updated_at before update on public.projects
  for each row execute procedure public.handle_updated_at();

create trigger rpm_blocks_updated_at before update on public.rpm_blocks
  for each row execute procedure public.handle_updated_at();

create trigger actions_updated_at before update on public.actions
  for each row execute procedure public.handle_updated_at();
