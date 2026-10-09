-- Arregla las 5 advertencias del Security Advisor.
-- Pegar completo en: Supabase -> SQL Editor -> New query -> Run
-- Se puede ejecutar mas de una vez. No borra datos.

-- 1) set_updated_at: fijar el search_path
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- 2) handle_new_user: que nadie la pueda llamar por la API
--    (el trigger de registro sigue funcionando igual)
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- 3) current_user_role: moverla a un schema privado que la API no expone
create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.current_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;

revoke execute on function private.current_user_role() from public, anon;
grant execute on function private.current_user_role() to authenticated;

-- 4) Volver a crear las policies que usaban la funcion vieja
drop policy if exists "medidas: crear las propias" on public.customer_measurements;
create policy "medidas: crear las propias" on public.customer_measurements
  for insert to authenticated
  with check (user_id = auth.uid() and private.current_user_role() = 'customer');

drop policy if exists "productos: ver" on public.products;
create policy "productos: ver" on public.products
  for select to authenticated
  using (supplier_id = auth.uid() or private.current_user_role() = 'customer');

drop policy if exists "productos: crear propios" on public.products;
create policy "productos: crear propios" on public.products
  for insert to authenticated
  with check (supplier_id = auth.uid() and private.current_user_role() = 'supplier');

drop policy if exists "imagenes: proveedor sube en su carpeta" on storage.objects;
create policy "imagenes: proveedor sube en su carpeta" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
    and private.current_user_role() = 'supplier'
  );

-- 5) Borrar la funcion vieja (ya no la usa ninguna policy)
drop function if exists public.current_user_role();
