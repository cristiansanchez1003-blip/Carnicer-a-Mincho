# 🥩 Carnicería Mincho — Menú Digital

Menú digital para **Carnicería Mincho** (Comercio 19881, San José de Maipo, Región Metropolitana, Chile). Los clientes escanean un QR y ven el catálogo en su celular; Gloria administra productos, precios, fotos y datos del local desde un panel privado con usuario y contraseña.

Construido con **Next.js 14 (App Router)**, **Tailwind CSS**, **Framer Motion** y **qrcode.react**, sobre la misma arquitectura probada de El Café de Pirque. **Sin base de datos pagada**: el catálogo vive en `data/menu.json` dentro de este repositorio y el panel admin lo edita mediante la **API de GitHub** (gratis, con historial de cambios). Las fotos se suben a **Cloudinary** (plan gratuito).

---

## ✨ Funcionalidades

- **Menú público** (`/menu`) — 6 categorías y 40 productos de ejemplo (cortes chilenos: lomo vetado, punta de ganso, posta rosada, longaniza de Chillán…). Hero con el logotipo, navegación de categorías, modal de producto tipo bottom-sheet, precios con **unidad de venta** ($/kg, c/u, /docena), footer con **mapa de Google embebido**, WhatsApp y horario, y botón flotante de WhatsApp. 100 % mobile-first.
- **Modo oscuro por defecto** — el letrero Mincho sobre negro; el cliente puede cambiar a modo claro (fondo crema madera) y su elección queda guardada en el navegador. El logotipo cambia según el tema.
- **Panel admin** (`/admin`) — login con usuario y contraseña (cookie httpOnly firmada con HMAC).
  - Productos: crear, editar, eliminar, reordenar, disponibilidad, búsqueda, filtro por categoría y **unidad de venta** (kilo / unidad / docena).
  - Imágenes: subida directa a Cloudinary o pegando una URL.
  - Categorías: crear, renombrar, cambiar emoji, eliminar.
  - Ajustes del local: horario, dirección, mapa embebido, WhatsApp, Instagram (opcional), correo (opcional), eslogan.
  - Código QR descargable en PNG.
- **Persistencia sin base de datos**: cada "Guardar cambios" hace un commit de `data/menu.json` al repo vía API de GitHub. Los cambios se ven en el menú público en segundos (no requiere redeploy).

---

## 🎨 Identidad visual (tomada del letrero)

| Uso | Color |
|-----|-------|
| Rojo letrero (precios y acciones) | `#B3271D` |
| Amarillo letrero (acentos) | `#FFC93C` |
| Azul letrero | `#2E6FB7` |
| Fondo modo oscuro (por defecto) | `#151312` |
| Fondo modo claro | `#F5EFE4` (crema madera) |

Fuentes: **Playfair Display** (títulos) + **Lato** (texto). Logos: `public/logo-dark.jpeg` (modo oscuro) y `public/logo-light.jpeg` (modo claro).

---

## 🚀 Puesta en marcha local

```bash
npm install
```

Crea `.env.local` a partir de `.env.local.example`. Para desarrollo basta con:

```env
ADMIN_USER=Gloria
ADMIN_PASSWORD=una-contraseña
AUTH_SECRET=cualquier-texto-largo
```

Sin `GITHUB_TOKEN`, el panel guarda directamente en `data/menu.json` local (ideal para desarrollo).

```bash
npm run dev
```

- Menú: [http://localhost:3000/menu](http://localhost:3000/menu)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## ☁️ Configuración en Vercel (producción)

En **Vercel → Project → Settings → Environment Variables** agrega:

| Variable | Valor |
|----------|-------|
| `ADMIN_USER` | usuario del panel (ej: `Gloria`) |
| `ADMIN_PASSWORD` | contraseña fuerte para Gloria |
| `AUTH_SECRET` | texto aleatorio largo (firma las sesiones) |
| `GITHUB_TOKEN` | token *fine-grained* con permiso **Contents: Read & Write** solo sobre este repo |
| `GITHUB_REPO` | `cristiansanchez1003-blip/menucarniceriamincho` |
| `GITHUB_BRANCH` | `main` |
| `CLOUDINARY_CLOUD_NAME` | desde el dashboard de Cloudinary |
| `CLOUDINARY_API_KEY` | desde el dashboard de Cloudinary |
| `CLOUDINARY_API_SECRET` | desde el dashboard de Cloudinary |
| `NEXT_PUBLIC_SITE_URL` | URL pública (ej: `https://menucarniceriamincho.vercel.app`) |

### Crear el token de GitHub

1. GitHub → **Settings → Developer settings → Fine-grained tokens → Generate new token**.
2. Repository access: **Only select repositories** → este repo.
3. Permissions → Repository permissions → **Contents: Read and write**.
4. Expiración: 1 año (renovar cuando expire). Copia el token a Vercel.

### Crear la cuenta de Cloudinary (gratis)

1. Regístrate en [cloudinary.com](https://cloudinary.com).
2. En el **Dashboard** copia *Cloud name*, *API Key* y *API Secret* a Vercel.
3. Sin Cloudinary el panel funciona igual: se puede pegar la URL de cualquier imagen.

> Después de agregar o cambiar variables, haz **Redeploy** en Vercel.

---

## 📁 Estructura

```
app/
  layout.jsx              Root layout + fuentes
  page.jsx                Redirect a /menu
  menu/page.jsx           Menú público (categorías + modal)
  admin/
    layout.jsx            Guard de sesión
    login/page.jsx        Login usuario/contraseña
    dashboard/page.jsx    Panel: productos, ajustes, QR
  api/
    menu/route.js         GET menú (público)
    auth/…                login / logout / me (cookie firmada)
    admin/menu/route.js   PUT menú completo (commit a GitHub)
    admin/upload/route.js POST imagen a Cloudinary
components/
  menu/                   Hero, CategoryNav, ControlsBar (toggle de tema),
                          ProductCard, ProductModal, ProductImage, Footer, WhatsappFab
  admin/                  AdminHeader, ProductForm, ProductTable,
                          SettingsForm, CategoryManager, QRSection
contexts/AppContext.jsx   Tema (dark por defecto) + idioma
data/menu.json            ⭐ La "base de datos": settings + categorías + productos
hooks/                    useMenu (público) · useAdmin (panel)
lib/                      auth.js (HMAC) · menuStore.js (GitHub/local) · format.js (CLP + unidad)
public/logo-dark.jpeg     Logotipo para modo oscuro
public/logo-light.jpeg    Logotipo para modo claro
```

---

## 🔒 Notas de seguridad

- La contraseña **nunca** está en el código: vive en variables de entorno.
- La sesión es una cookie httpOnly firmada (HMAC-SHA256) con expiración de 7 días.
- La comparación de credenciales es en tiempo constante y soporta tildes/eñes.
- El token de GitHub solo tiene acceso a este repositorio.

Este menú fue hecho por **[Espíritu Digital](https://www.espiritudigital.cl)**.
