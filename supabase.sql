-- Brief Quest: partidas guardadas por persona (cada uno ve y escribe solo las suyas)
create table if not exists public.saves (
  user_id  uuid   not null references auth.users (id) on delete cascade,
  slot     int    not null check (slot between 1 and 4),
  data     text   not null,
  saved_at bigint not null,
  primary key (user_id, slot)
);
alter table public.saves enable row level security;
drop policy if exists "leer lo propio" on public.saves;
drop policy if exists "crear lo propio" on public.saves;
drop policy if exists "cambiar lo propio" on public.saves;
drop policy if exists "borrar lo propio" on public.saves;
create policy "leer lo propio"    on public.saves for select using (auth.uid() = user_id);
create policy "crear lo propio"   on public.saves for insert with check (auth.uid() = user_id);
create policy "cambiar lo propio" on public.saves for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "borrar lo propio"  on public.saves for delete using (auth.uid() = user_id);
