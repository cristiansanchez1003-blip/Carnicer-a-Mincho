# Menú Digital Carnicería Mincho — Especificación de diseño

**Fecha:** 2026-07-13
**Estado:** Aprobado por Cristian (Espíritu Digital)

## Resumen

Menú digital para **Carnicería Mincho** (Comercio 19881, San José de Maipo, Región Metropolitana, Chile). Los clientes escanean un QR y ven el catálogo en su celular; la dueña (Gloria) administra productos, precios, fotos y datos del local desde un panel privado. Réplica de la arquitectura probada de El Café de Pirque, adaptada a carnicería.

## Arquitectura

- **Next.js 14 (App Router, JavaScript)** + **Tailwind CSS** + **Framer Motion** + **qrcode.react**.
- **Sin base de datos**: el catálogo vive en `data/menu.json` dentro del repo. El panel admin guarda cambios haciendo commits vía **API de GitHub** (token fine-grained, Contents RW). Sin token (desarrollo), guarda directo en el archivo local.
- **Imágenes**: subida a **Cloudinary** (plan gratuito) o URL pegada.
- **Deploy**: Vercel. Operación 100 % gratuita.

Estructura de carpetas idéntica a la cafetería: `app/` (menu, admin, api), `components/` (menu, admin), `data/menu.json`, `hooks/`, `lib/`, `public/`.

## Identidad visual

Tomada del logotipo (letrero retro de barrio):

| Uso | Color |
|-----|-------|
| Rojo letrero (títulos, acentos) | `#D63426` |
| Amarillo letrero (bordes, resaltes) | `#FFC93C` |
| Azul letrero (acciones secundarias) | `#2E6FB7` |
| Fondo dark (por defecto) | Negro carbón `#111111` aprox. |
| Fondo light | Crema madera `#F5EFE4` aprox. |

- **Dark mode es el tema por defecto**; toggle visible para cambiar a light mode. La preferencia se persiste en `localStorage`.
- El hero usa `Logotipo mincho dark.jpeg` en dark y `Logotipo mincho light.jpeg` en light (se copian a `public/` con nombres normalizados).
- Tipografías: serif contundente para títulos (estilo letrero) + sans legible para texto.

## Menú público (`/menu`)

- Hero con el logotipo según tema activo.
- Navegación de categorías con scrollspy.
- Tarjetas de producto: nombre, precio en CLP y **unidad de venta** (`$/kg`, `$/un`, `$/malla`, etc.) — campo nuevo respecto a la cafetería.
- Modal bottom-sheet con foto, descripción y sugerencia de preparación.
- Footer:
  - Dirección real: **Comercio 19881, 9460122 San José de Maipo, Región Metropolitana** + **mapa de Google embebido** (iframe embed, sin API key).
  - WhatsApp y horario: placeholders editables desde el panel.
  - Instagram: no tienen; el campo queda opcional en el panel (si está vacío, no se muestra).
  - Crédito obligatorio: “Este menú fue hecho por **Espíritu Digital**” linkeado a `https://www.espiritudigital.cl`.
- Botón flotante de WhatsApp.
- 100 % mobile-first.

## Panel admin (`/admin`)

- Login usuario/contraseña con cookie httpOnly firmada (HMAC-SHA256, expiración 7 días).
- Credenciales iniciales (variables de entorno, nunca en el código): usuario `Gloria`, contraseña `carnicería mincho 2026`.
- Productos: crear, editar, eliminar, reordenar, disponibilidad, búsqueda, filtro por categoría, **campo unidad de venta**.
- Categorías: crear, renombrar, cambiar emoji, eliminar.
- Ajustes del local: dirección, WhatsApp, horario, Instagram (opcional), eslogan.
- Imágenes: Cloudinary o URL.
- Código QR descargable en PNG.

## Datos semilla

Catálogo de ejemplo de carnicería premium chilena, con cortes chilenos reales y precios aproximados de Santiago 2026. Gloria luego edita todo desde el panel.

Categorías: **Vacuno** (lomo vetado, lomo liso, filete, punta de ganso, posta rosada, posta negra, asado de tira, plateada, huachalomo, sobrecostilla, abastero, malaya, tapapecho…), **Cerdo** (pulpa, costillar, chuletas, malaya de cerdo…), **Pollo y ave** (trutro, pechuga, pollo entero…), **Cordero**, **Embutidos y longanizas** (longaniza de Chillán, prietas, chorizos…), **Otros** (huevos, carbón, quesos).

Restricciones explícitas del cliente:
- **No** incluir “mix parrilleros”.
- **No** inventar ofertas ni packs; eso lo decidirá la carnicería.

Imágenes placeholder desde Unsplash (URLs directas `images.unsplash.com`, licencia libre), acordes a cada corte.

## Manejo de errores

Igual que la cafetería: si falla el commit a GitHub, el panel muestra el error y no pierde los cambios en pantalla; el menú público sirve el último `menu.json` válido. Sesión expirada redirige a login.

## Pruebas / verificación

- `npm run build` sin errores.
- Verificación manual en navegador: menú público en dark y light, flujo de login con las credenciales de Gloria, CRUD de un producto, guardado local de `menu.json`, QR descargable, mapa y crédito de Espíritu Digital visibles en el footer.
