# Menú Digital Carnicería Mincho — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Menú digital con QR y panel de administración para Carnicería Mincho, portando la arquitectura probada de El Café de Pirque.

**Architecture:** Se copia el código fuente de `C:\Users\cristian1\Desktop\Cafetería de Pirque` (Next.js 14 App Router + Tailwind + Framer Motion, persistencia en `data/menu.json` vía API de GitHub, imágenes Cloudinary) y se adapta: paleta retro del letrero Mincho, dark mode por defecto con logo por tema, campo **unidad de venta** en productos, footer con mapa embebido y crédito de Espíritu Digital, catálogo semilla de carnicería chilena.

**Tech Stack:** Next.js 14.2 (JS), Tailwind 3.4, Framer Motion 11, qrcode.react 4. Sin suite de tests en el proyecto fuente: la verificación de cada tarea es `npm run build` + comprobación manual en navegador (patrón del proyecto original).

## Global Constraints

- Fuente a portar: `C:\Users\cristian1\Desktop\Cafetería de Pirque` (rutas exactas abajo). Destino: raíz de este repo.
- Credenciales iniciales SOLO en `.env.local` (nunca en código): `ADMIN_USER=Gloria`, `ADMIN_PASSWORD=carnicería mincho 2026`.
- Footer siempre con crédito: “Este menú fue hecho por **Espíritu Digital**” → `https://www.espiritudigital.cl`.
- Dirección real: `Comercio 19881, 9460122 San José de Maipo, Región Metropolitana` + mapa Google embebido (iframe `https://www.google.com/maps?q=...&output=embed`, sin API key).
- Dark mode por defecto; light mode como opción persistida en `localStorage`. Logo `public/logo-dark.jpeg` en dark, `public/logo-light.jpeg` en light.
- Prohibido: categoría/productos “mix parrilleros”, ofertas o packs inventados, Instagram visible (campo queda opcional y oculto si está vacío).
- Botón de idioma ES/EN se elimina de la UI (queda la infraestructura i18n, idioma fijo `es`).
- Paleta Mincho (Tailwind): rojo `#D63426`, amarillo `#FFC93C`, azul `#2E6FB7`, carbón `#111111`, crema `#F5EFE4`.
- Commits frecuentes, mensajes en español, convención `feat:`/`chore:`/`docs:`.

---

### Task 1: Scaffold — portar el proyecto base

**Files:**
- Create (copiando de la cafetería): `app/**`, `components/**`, `contexts/AppContext.jsx`, `hooks/useAdmin.js`, `hooks/useMenu.js`, `lib/auth.js`, `lib/format.js`, `lib/i18n.js`, `lib/menuStore.js`, `jsconfig.json`, `next.config.js`, `postcss.config.js`, `tailwind.config.js`, `.gitignore`, `package.json`
- Create: `public/logo-dark.jpeg`, `public/logo-light.jpeg` (desde los JPEG de la raíz)
- NO copiar: `node_modules/`, `.next/`, `.git/`, `.env*`, `data/menu.json` (se reescribe en Task 3), `public/images/products/` (fotos de la cafetería), `README.md` (se reescribe en Task 8)

**Interfaces:**
- Produces: proyecto Next.js que compila y levanta en dev; alias `@/` (jsconfig); `contexts/AppContext.jsx` exporta `useApp()` con `{ lang, toggleLang, theme, toggleTheme, t }`; `lib/format.js` exporta `formatCLP(value)`.

- [x] **Step 1: Copiar archivos fuente** con robocopy, respetando las exclusiones listadas arriba:

```powershell
$src = "C:\Users\cristian1\Desktop\Cafetería de Pirque"; $dst = "C:\Users\cristian1\Desktop\Carnicería Mincho"
robocopy "$src\app" "$dst\app" /E
robocopy "$src\components" "$dst\components" /E
robocopy "$src\contexts" "$dst\contexts" /E
robocopy "$src\hooks" "$dst\hooks" /E
robocopy "$src\lib" "$dst\lib" /E
Copy-Item "$src\jsconfig.json","$src\next.config.js","$src\postcss.config.js","$src\tailwind.config.js","$src\.gitignore","$src\package.json" $dst
New-Item -ItemType Directory -Force "$dst\public\images\products"
Copy-Item "$dst\Logotipo mincho dark.jpeg" "$dst\public\logo-dark.jpeg"
Copy-Item "$dst\Logotipo mincho light.jpeg" "$dst\public\logo-light.jpeg"
```

- [x] **Step 2: `data/menu.json` mínimo provisional** — `{ "settings": {…Mincho…}, "categories": [], "products": [] }` para que el build no falle antes de Task 3.

- [x] **Step 3: package.json** — cambiar `name` a `carniceria-mincho` y `description` a `Menú digital para Carnicería Mincho`.

- [x] **Step 4: Instalar y verificar build**

Run: `npm install` y luego `npm run build`
Expected: build OK (warnings aceptables, cero errores).

- [x] **Step 5: Commit** — `chore: scaffold desde El Café de Pirque + logos Mincho`

### Task 2: Identidad Mincho — paleta, fuentes, tema oscuro por defecto, logos por tema

**Files:**
- Modify: `tailwind.config.js` (paleta), `app/globals.css` (fuentes/fondos), `app/layout.jsx` (metadata + fuentes), `contexts/AppContext.jsx` (default dark, sin toggle de idioma en UI), `components/menu/ControlsBar.jsx` (quitar botón ES/EN), `components/menu/Hero.jsx` (logo por tema), `app/admin/login/page.jsx` (logo por tema), `lib/i18n.js` (textos de carnicería)

**Interfaces:**
- Consumes: `useApp()` de Task 1.
- Produces: tokens Tailwind `mincho.red #D63426`, `mincho.yellow #FFC93C`, `mincho.blue #2E6FB7`, `mincho.coal #111111`, `mincho.cream #F5EFE4` (además se re-mapean los tokens existentes de la cafetería — `paper`, `ink`, `mint`, `pine`, `card`, `linen` y sus variantes `*dark` — a la paleta Mincho para no tocar cada componente); helper de logo: `theme === 'dark' ? '/logo-dark.jpeg' : '/logo-light.jpeg'`.

- [x] **Step 1: Leer los archivos a modificar** (`tailwind.config.js`, `globals.css`, `layout.jsx`, `AppContext.jsx`, `Hero.jsx`, `login/page.jsx`) para mapear tokens y puntos de cambio exactos.
- [x] **Step 2: Re-mapear paleta en `tailwind.config.js`**: valores light → tonos crema/carbón/rojo Mincho; valores dark → carbón/rojo/amarillo. Mantener los NOMBRES de tokens existentes para no reescribir componentes.
- [x] **Step 3: `AppContext.jsx`**: estado inicial `theme = 'dark'` (y si no hay valor en `localStorage`, usar `'dark'`); `lang` fijo `'es'`.
- [x] **Step 4: `ControlsBar.jsx`**: eliminar el botón de idioma; dejar solo el toggle de tema.
- [x] **Step 5: `Hero.jsx` y `login/page.jsx`**: usar el logo según `theme`. `layout.jsx`: title `Carnicería Mincho — Menú`, description con San José de Maipo. Fuentes: mantener Playfair Display + Lato (espíritu de letrero clásico, ya cargadas).
- [x] **Step 6: `lib/i18n.js`**: adaptar textos (`heroSlogan: 'Carnes seleccionadas y atención de barrio en San José de Maipo'`, `contactSectionSubtitle: 'Encargos y consultas'`, etc.). Solo diccionario `es` importa.
- [x] **Step 7: Verificar** — `npm run dev`, abrir `/menu`: carga en dark con logo dark; toggle cambia a light con logo light y persiste al recargar.
- [x] **Step 8: Commit** — `feat: identidad visual Mincho con dark mode por defecto`

### Task 3: Catálogo semilla + unidad de venta en el modelo

**Files:**
- Create: `data/menu.json` (definitivo)

**Interfaces:**
- Produces: productos con campo nuevo `unit` (`"kg" | "un" | "docena"`); `settings` con `instagram: ""` (vacío = oculto), `mapsEmbed` (URL del iframe). Task 4 y 5 consumen `unit`; Task 5 consume `mapsEmbed`.

**Settings:**

```json
{
  "name": "Carnicería Mincho",
  "slogan": "Carnes seleccionadas y atención de barrio en San José de Maipo",
  "address": "Comercio 19881, San José de Maipo, Región Metropolitana",
  "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Comercio+19881+San+Jos%C3%A9+de+Maipo+Chile",
  "mapsEmbed": "https://www.google.com/maps?q=Comercio+19881,+San+Jos%C3%A9+de+Maipo,+Chile&output=embed",
  "hours": "Lunes a domingo · 9:00 a 20:00 (editar horario real)",
  "whatsapp": "56900000000",
  "instagram": "",
  "instagramHandle": "",
  "email": ""
}
```

**Categorías:** 🥩 Vacuno · 🐖 Cerdo · 🐔 Pollo y ave · 🐑 Cordero · 🌭 Embutidos y longanizas · 🧺 Otros (sort 1–6, ids: `vacuno`, `cerdo`, `pollo-ave`, `cordero`, `embutidos`, `otros`).

**Productos** (precios aproximados CLP, carnicería premium RM 2026; descripción breve con sugerencia de preparación; todos `available: true`, `image: ""` hasta Task 6):

| Categoría | Producto | Precio | unit |
|---|---|---|---|
| vacuno | Filete | 22990 | kg |
| vacuno | Lomo vetado | 16990 | kg |
| vacuno | Lomo liso | 15990 | kg |
| vacuno | Entraña | 17990 | kg |
| vacuno | Punta de ganso | 13990 | kg |
| vacuno | Punta picana | 14990 | kg |
| vacuno | Asado de tira | 12990 | kg |
| vacuno | Plateada | 13490 | kg |
| vacuno | Posta rosada | 12990 | kg |
| vacuno | Posta negra | 12490 | kg |
| vacuno | Huachalomo | 10990 | kg |
| vacuno | Sobrecostilla | 9990 | kg |
| vacuno | Abastero | 10490 | kg |
| vacuno | Malaya | 9990 | kg |
| vacuno | Tapapecho | 10990 | kg |
| vacuno | Osobuco | 8990 | kg |
| vacuno | Asado carnicero | 11990 | kg |
| vacuno | Carne molida especial | 9490 | kg |
| cerdo | Filete de cerdo | 8490 | kg |
| cerdo | Costillar de cerdo | 8990 | kg |
| cerdo | Chuletas centro | 7990 | kg |
| cerdo | Pulpa de cerdo | 7490 | kg |
| cerdo | Malaya de cerdo | 6990 | kg |
| pollo-ave | Pollo entero | 3990 | kg |
| pollo-ave | Pechuga de pollo | 6490 | kg |
| pollo-ave | Trutro entero | 4490 | kg |
| pollo-ave | Trutro corto | 4990 | kg |
| pollo-ave | Alitas de pollo | 4290 | kg |
| cordero | Costillar de cordero | 15990 | kg |
| cordero | Pierna de cordero | 13990 | kg |
| cordero | Paleta de cordero | 12990 | kg |
| embutidos | Longaniza de Chillán | 8990 | kg |
| embutidos | Longaniza artesanal | 7990 | kg |
| embutidos | Chorizo parrillero | 7490 | kg |
| embutidos | Prietas | 6990 | kg |
| embutidos | Chunchules | 5990 | kg |
| embutidos | Vienesas | 4490 | kg |
| otros | Huevos de campo | 3490 | docena |
| otros | Carbón de espino (saco 5 kg) | 7990 | un |
| otros | Queso mantecoso | 10990 | kg |

- [x] **Step 1: Escribir `data/menu.json`** con la estructura de la cafetería (`settings`, `categories[]`, `products[]` con `id` slug, `category`, `name`, `description`, `price`, `unit`, `image`, `available`, `sort`). Sin campos `*_en`.
- [x] **Step 2: Verificar** — `/menu` muestra las 6 categorías y los 40 productos; `/api/menu` responde el JSON.
- [x] **Step 3: Commit** — `feat: catálogo semilla de carnicería chilena con unidad de venta`

### Task 4: Unidad de venta en la UI pública

**Files:**
- Modify: `lib/format.js`, `components/menu/ProductCard.jsx`, `components/menu/ProductModal.jsx`

**Interfaces:**
- Produces: `formatPrice(price, unit)` → `"$12.990 /kg"`, `"$3.490 /docena"`, `"$7.990 c/u"` (unit `un` → `c/u`; unit vacío → solo el precio, retrocompatible).

```js
// lib/format.js — agregar
const UNIT_LABELS = { kg: '/kg', un: 'c/u', docena: '/docena' }
export function formatPrice(price, unit) {
  const base = formatCLP(price)
  const label = UNIT_LABELS[unit]
  return label ? `${base} ${label}` : base
}
```

- [x] **Step 1: Agregar `formatPrice` a `lib/format.js`** (código de arriba).
- [x] **Step 2: Usarlo en `ProductCard.jsx` y `ProductModal.jsx`** en lugar de `formatCLP` donde se muestra el precio del producto.
- [x] **Step 3: Verificar** — tarjetas muestran `$12.990 /kg`, huevos `$3.490 /docena`, carbón `$7.990 c/u`.
- [x] **Step 4: Commit** — `feat: precios con unidad de venta en menú público`

### Task 5: Footer — mapa embebido, Instagram opcional, crédito Espíritu Digital

**Files:**
- Modify: `components/menu/Footer.jsx`

**Interfaces:**
- Consumes: `settings.mapsEmbed`, `settings.instagram` (Task 3).

- [x] **Step 1: Leer `Footer.jsx`** del port para ubicar bloques de contacto y crédito.
- [x] **Step 2: Mapa embebido** — bajo la dirección, iframe responsivo:

```jsx
{settings.mapsEmbed && (
  <div className="mt-4 overflow-hidden rounded-2xl border border-linen dark:border-linendark">
    <iframe src={settings.mapsEmbed} title="Mapa Carnicería Mincho" className="h-56 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
  </div>
)}
```

- [x] **Step 3: Canales condicionales** — Instagram y correo solo se renderizan si el valor no está vacío (WhatsApp y dirección siempre).
- [x] **Step 4: Crédito** — texto exacto `Este menú fue hecho por Espíritu Digital` con link a `https://www.espiritudigital.cl` (ajustar el bloque existente).
- [x] **Step 5: Verificar** — footer muestra mapa interactivo de Comercio 19881, sin Instagram ni correo, crédito clickeable.
- [x] **Step 6: Commit** — `feat: footer con mapa embebido y crédito Espíritu Digital`

### Task 6: Panel admin — unidad de venta y ajustes de carnicería

**Files:**
- Modify: `components/admin/ProductForm.jsx`, `components/admin/ProductTable.jsx`, `components/admin/SettingsForm.jsx`, `components/admin/AdminHeader.jsx` (branding menor si aplica)

**Interfaces:**
- Consumes: `formatPrice` (Task 4), campo `unit` (Task 3).
- Produces: `<select>` de unidad en el form (`kg` → “por kilo ($/kg)”, `un` → “por unidad (c/u)”, `docena` → “por docena”), default `kg`; SettingsForm con campo `mapsEmbed` y ayuda “pega aquí la URL de Google Maps con &output=embed”; Instagram marcado “(opcional — si lo dejas vacío no se muestra)”.

- [x] **Step 1: Leer los 4 archivos** para ubicar el form de producto y el form de ajustes.
- [x] **Step 2: `ProductForm.jsx`** — agregar `<select name="unit">` con las 3 opciones, persistiendo en el producto; default `kg`.
- [x] **Step 3: `ProductTable.jsx`** — columna/etiqueta de precio usando `formatPrice(p.price, p.unit)`.
- [x] **Step 4: `SettingsForm.jsx`** — agregar campo `mapsEmbed`; etiquetar Instagram y correo como opcionales.
- [x] **Step 5: Verificar** — login → crear producto de prueba con unidad `docena`, ver que aparece en `/menu` con `/docena`; editar ajustes y ver reflejo en footer. Eliminar el producto de prueba.
- [x] **Step 6: Commit** — `feat: panel admin con unidad de venta y ajustes de carnicería`

### Task 7: Imágenes de cortes (Unsplash)

**Files:**
- Modify: `data/menu.json` (campo `image` de los productos)

- [x] **Step 1: Buscar en Unsplash** fotos acordes por grupo (vacuno crudo premium, costillar cerdo, pollo, cordero, longanizas/embutidos, huevos, carbón, queso). Obtener URLs directas `https://images.unsplash.com/photo-<id>?w=800&q=80`.
- [x] **Step 2: Verificar cada URL** con `curl -sI <url>` → `HTTP/2 200` y `content-type: image/*`. Descartar las que fallen.
- [x] **Step 3: Asignar** las URLs verificadas al campo `image` (reutilizar la misma foto en cortes similares es aceptable; producto sin foto adecuada queda `""` y usa el placeholder del componente `ProductImage`).
- [x] **Step 4: Configurar dominios remotos** — verificar que `next.config.js` permita `images.unsplash.com` (agregar a `remotePatterns` si falta).
- [x] **Step 5: Verificar** — `/menu` muestra fotos en tarjetas y modal sin imágenes rotas.
- [x] **Step 6: Commit** — `feat: imágenes placeholder de Unsplash para el catálogo`

### Task 8: Credenciales, README y verificación final

**Files:**
- Create: `.env.local`, `.env.local.example`, `README.md`

- [x] **Step 1: `.env.local`** (no se commitea; `.gitignore` ya lo excluye):

```env
ADMIN_USER=Gloria
ADMIN_PASSWORD=carnicería mincho 2026
AUTH_SECRET=<generar: 64 caracteres aleatorios>
```

- [x] **Step 2: `.env.local.example`** — mismas claves más `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH`, `CLOUDINARY_*`, `NEXT_PUBLIC_SITE_URL`, con comentarios (adaptar del ejemplo de la cafetería).
- [x] **Step 3: `README.md`** — adaptación del README de la cafetería: nombre, dirección, credenciales por variable de entorno, instrucciones Vercel/GitHub/Cloudinary, estructura.
- [x] **Step 4: Build final** — `npm run build` → cero errores.
- [x] **Step 5: Verificación manual completa** — dark por defecto y toggle persistente; scrollspy; modal con unidad; footer (mapa, WhatsApp, horario, sin Instagram, crédito Espíritu Digital → espiritudigital.cl); login Gloria; CRUD producto; QR PNG descargable.
- [x] **Step 6: Commit** — `docs: README y configuración de entorno` y luego commit final si quedaron ajustes.

---

## Post-plan (fuera de alcance de este plan)

Deploy: crear repo en GitHub, conectar a Vercel, configurar variables de entorno de producción y token fine-grained — igual que la cafetería. Se hará cuando Cristian lo pida.
