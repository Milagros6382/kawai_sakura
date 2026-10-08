-- =====================================================================
-- Esquema del MVP de compatibilidad de talles
-- Ejecutar completo en: Supabase Dashboard → SQL Editor → New query → Run
-- Es seguro ejecutarlo más de una vez (usa "if not exists" / "or replace").
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. PROFILES: un perfil por cada usuario de Supabase Auth
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  role        text not null check (role in ('customer', 'supplier')),
  created_at  timestamptz not null default now()
);

-- Crea el perfil automáticamente cuando alguien se registra.
-- El rol llega desde el formulario de registro como "metadata" del usuario.
-- Se hace con un trigger (y no desde React) porque funciona aunque el
-- usuario todavía no haya confirmado su email y no tenga sesión.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  requested_role text := new.raw_user_meta_data ->> 'role';
begin
  if requested_role is null or requested_role not in ('customer', 'supplier') then
    raise exception 'Rol inválido: %', requested_role;
  end if;

  insert into public.profiles (id, email, role)
  values (new.id, new.email, requested_role);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------------------------------------------------------------------
-- 2. CUSTOMER_MEASUREMENTS: las 3 medidas de cada cliente (en cm)
-- ---------------------------------------------------------------------
create table if not exists public.customer_measurements (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references public.profiles (id) on delete cascade,
  bust         numeric(5,1) not null check (bust > 0 and bust < 300),
  body_length  numeric(5,1) not null check (body_length > 0 and body_length < 300),
  hip          numeric(5,1) not null check (hip > 0 and hip < 300),
  updated_at   timestamptz not null default now()
);
-- "unique" en user_id: cada cliente tiene UNA fila de medidas (y crea un índice).


-- ---------------------------------------------------------------------
-- 3. PRODUCTS: prendas creadas por proveedores (medidas en cm)
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  supplier_id  uuid not null references public.profiles (id) on delete cascade,
  name         text not null check (char_length(name) between 1 and 120),
  image_url    text,
  bust         numeric(5,1) not null check (bust > 0 and bust < 300),
  length       numeric(5,1) not null check (length > 0 and length < 300),
  hip          numeric(5,1) not null check (hip > 0 and hip < 300),
  created_at   timestamptz not null default now()
);

create index if not exists products_supplier_id_idx on public.products (supplier_id);


-- ---------------------------------------------------------------------
-- updated_at automático en customer_measurements
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists customer_measurements_updated_at on public.customer_measurements;
create trigger customer_measurements_updated_at
  before update on public.customer_measurements
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- Función auxiliar: rol del usuario que hace la petición
-- "security definer" la ejecuta con permisos del dueño, así las policies
-- pueden consultar profiles sin depender de las policies de profiles.
-- ---------------------------------------------------------------------
create or replace function public.current_user_role()
returns text
language sql
stable
security definer set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;


-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- Con RLS activado, una tabla NO devuelve ni acepta nada salvo lo que
-- permitan explícitamente las policies de abajo.
-- =====================================================================
alter table public.profiles              enable row level security;
alter table public.customer_measurements enable row level security;
alter table public.products              enable row level security;

-- PROFILES: cada usuario solo ve su propio perfil.
-- No hay policy de insert/update/delete: el perfil lo crea el trigger y
-- nadie puede cambiarse el rol desde la aplicación.
drop policy if exists "profiles: ver el propio" on public.profiles;
create policy "profiles: ver el propio" on public.profiles
  for select to authenticated
  using (id = auth.uid());

-- CUSTOMER_MEASUREMENTS: solo el propio cliente lee y escribe sus medidas.
drop policy if exists "medidas: ver las propias" on public.customer_measurements;
create policy "medidas: ver las propias" on public.customer_measurements
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "medidas: crear las propias" on public.customer_measurements;
create policy "medidas: crear las propias" on public.customer_measurements
  for insert to authenticated
  with check (user_id = auth.uid() and public.current_user_role() = 'customer');

drop policy if exists "medidas: editar las propias" on public.customer_measurements;
create policy "medidas: editar las propias" on public.customer_measurements
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- PRODUCTS:
--   clientes → ven todas las prendas (catálogo)
--   proveedores → ven, crean, editan y eliminan solo las suyas
drop policy if exists "productos: ver" on public.products;
create policy "productos: ver" on public.products
  for select to authenticated
  using (supplier_id = auth.uid() or public.current_user_role() = 'customer');

drop policy if exists "productos: crear propios" on public.products;
create policy "productos: crear propios" on public.products
  for insert to authenticated
  with check (supplier_id = auth.uid() and public.current_user_role() = 'supplier');

drop policy if exists "productos: editar propios" on public.products;
create policy "productos: editar propios" on public.products
  for update to authenticated
  using (supplier_id = auth.uid())
  with check (supplier_id = auth.uid());

drop policy if exists "productos: eliminar propios" on public.products;
create policy "productos: eliminar propios" on public.products
  for delete to authenticated
  using (supplier_id = auth.uid());


-- =====================================================================
-- STORAGE: bucket para las imágenes de las prendas
-- Público para lectura (las <img> cargan con una URL directa).
-- Cada proveedor sube dentro de una carpeta con su propio id:
--   product-images/<supplier_id>/<archivo>
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "imagenes: proveedor sube en su carpeta" on storage.objects;
create policy "imagenes: proveedor sube en su carpeta" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.current_user_role() = 'supplier'
  );

drop policy if exists "imagenes: proveedor edita su carpeta" on storage.objects;
create policy "imagenes: proveedor edita su carpeta" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "imagenes: proveedor elimina su carpeta" on storage.objects;
create policy "imagenes: proveedor elimina su carpeta" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);
