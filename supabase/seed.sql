-- =====================================================================
-- Datos iniciales: la prenda de ejemplo "Vestido Kawaii"
--
-- Requisito: primero registra una cuenta de PROVEEDOR en la app.
-- Luego reemplaza el email de abajo por el de esa cuenta y ejecuta
-- este archivo en el SQL Editor de Supabase.
--
-- IMAGEN: este seed deja image_url vacío (la app muestra un marcador).
-- Para tener la imagen real en Storage, la forma recomendada es crear la
-- prenda desde el panel /supplier subiendo la foto. Si ya ejecutaste este
-- seed y luego subes una imagen a mano al bucket "product-images", copia
-- su URL pública y ejecuta:
--   update public.products set image_url = 'URL_PUBLICA' where name = 'Vestido Kawaii';
-- =====================================================================
insert into public.products (supplier_id, name, image_url, bust, length, hip)
select p.id, 'Vestido Kawaii', null, 90, 85, 100
from public.profiles p
where p.email = 'proveedor@ejemplo.com'   -- ← CAMBIA ESTE EMAIL
  and p.role = 'supplier'
  and not exists (select 1 from public.products where name = 'Vestido Kawaii');
