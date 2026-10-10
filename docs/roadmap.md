# Carnicería Mincho — Ideas y plan de mejoras

> Documento vivo. Actualizado el 2026-10-10. Se ejecuta paso a paso: cada etapa deja el sitio
> funcionando y cada tarea tiene un criterio claro de "terminado".
> **Regla del proyecto:** no se inventan ofertas, packs ni textos comerciales; todo lo comercial
> lo define Nicolás desde el panel (las funciones nuevas parten vacías).

## 1. Dónde estamos hoy (datos reales del menú)

| Dato | Valor | Lectura |
|---|---|---|
| Productos | 51 en 4 categorías (32 vacuno, 8 cerdo, 5 pollo/ave, 6 subproductos y embutidos) | Catálogo ya cargado por Nicolás |
| Con foto | **15 de 51 (29 %)**, y son fotos genéricas de stock | Mayor oportunidad visual y de confianza |
| En inglés | **9 de 51** tienen nombre y descripción traducidos | El botón EN existe, pero la mayoría queda en español |
| Unidad de venta | 51 de 51 por kilo | Un pedido natural es "cuántos kilos" |
| Horario | Texto largo con 3 tramos distintos según el día | Difícil de leer; no puede decir "abierto ahora" |
| Contacto | WhatsApp cargado; sin Instagram ni correo | El WhatsApp es el canal de venta |
| Ubicación | Corregida a coordenadas exactas (calle Comercio, Las Pataguas) | Falta confirmar el número de la calle con Nicolás |

**Lo ya construido** (sesiones del 8 y 10 de octubre): subida de fotos reducidas en el navegador,
errores claros, botón "Probar conexiones", guardado seguro, validación del menú, cabeceras de
seguridad, 72 pruebas automáticas, migración a Next 16 / React 19 (0 vulnerabilidades en producción).

### Hecho el 2026-10-10

| Idea | Estado |
|---|---|
| C1 Pedido por WhatsApp con kilos | ✅ Hecho |
| C2 + P3 "Abierto ahora" y horario por día (con editor en el panel) | ✅ Hecho |
| C6 Calculadora de asado | ✅ Hecho (los gramos por persona y los cortes sugeridos son una referencia: validar con Nicolás) |
| C8 Inglés completo (51 productos, categorías, eslogan, horario) | ✅ Hecho, con campos de inglés en el panel |
| P1 Ajuste masivo de precios con vista previa | ✅ Hecho |
| P2 "Precios actualizados el…" | ✅ Hecho (se actualiza solo al cambiar un precio) |
| D5 (parcial) cierre con Escape, contraste corregido, ícono de la pestaña | ✅ Hecho |
| C3 Aviso editable en la portada (con fecha límite opcional y versión en inglés) | ✅ Hecho el 2026-10-10 (parte vacío: lo escribe Nicolás) |
| C9 Botones "Llamar" y "Dejar una reseña en Google" en el pie | ✅ Hecho (aparecen solo si Nicolás completa el teléfono y/o el enlace en Ajustes) |
| P5 (parcial) Aviso al cerrar o salir del panel con cambios sin guardar | ✅ Hecho (el borrador automático queda pendiente) |
| P10 Pestaña "Ayuda" en el panel con 9 tareas paso a paso | ✅ Hecho |
| C5 (parcial) Buscador del menú: por nombre o descripción, en español e inglés, sin importar tildes ni mayúsculas | ✅ Hecho el 2026-10-10 (las etiquetas de cocción quedan pendientes) |
| C4 Productos destacados: Nicolás elige "Recién llegado", "Del día" o "Recomendado" por producto; aparecen en la pestaña "⭐ Destacados" y con etiqueta | ✅ Hecho (parte sin destacados) |
| T4 Aviso en el panel cuando el acceso de GitHub vence en 15 días o menos, o ya falló | ✅ Hecho |
| T2 GitHub Actions: pruebas, lint y compilación en cada cambio de código (`.github/workflows/ci.yml`) | ✅ Hecho |
| Fotos subidas desde el panel, guardadas en el repositorio (sin Cloudinary) y servidas en variantes livianas | ✅ Hecho y probado en producción |

## 2. Las 5 ideas que más valor dan (en este orden)

1. **Fotos reales de los productos.** Hoy el 71 % no tiene foto y las que hay son de stock (pueden
   mostrar un corte distinto al que se vende). Es lo que más cambia la percepción de calidad y
   no requiere programar: se suben desde el celular en el panel (ya funciona, aunque pese 10 MB).
2. **Pedido por WhatsApp con kilos.** El cliente arma su lista ("2 kg lomo vetado, 1 kg
   longaniza"), ve el total estimado y se abre WhatsApp con el mensaje ya escrito para Nicolás.
   Sin pagos ni servidores nuevos. Convierte el menú en una herramienta de venta.
3. **Horario estructurado + "Abierto ahora".** Con su horario (miércoles solo hasta las 14:00,
   jueves y viernes hasta las 20:00) el cliente nunca sabe si llegar. Un indicador "Abierto ·
   cierra a las 14:00" y un aviso editable para feriados resuelven la pregunta más repetida.
4. **Ajuste masivo de precios + "Precios actualizados el…".** El precio de la carne cambia seguido.
   Subir o bajar un % a toda una categoría (con vista previa) ahorra editar 32 productos uno a uno,
   y la fecha visible genera confianza.
5. **Inglés completo y calculadora de asado.** Cajón del Maipo recibe turistas los fines de semana.
   Completar el inglés (propuesta de traducción para que Nicolás apruebe) y una calculadora
   "¿para cuántas personas?" que sugiere kilos y cortes del propio menú.

## 3. Catálogo completo de ideas

Esfuerzo: **S** ≈ medio día · **M** ≈ 1–3 días · **L** ≈ más de 3 días.
"Nicolás" = requiere que él aporte contenido o decida algo.

### Para los clientes
| # | Idea | Qué gana el cliente / Nicolás | Esf. | Nicolás |
|---|---|---|---|---|
| C1 | Pedido por WhatsApp con kilos y total estimado | Pedidos claros, menos idas y vueltas | M | Revisar el texto del mensaje |
| C2 | Indicador "Abierto ahora" + horario por día | Menos consultas por horario | M | Confirmar horarios |
| C3 | Aviso editable en la portada (feriados, "cerrado hoy", llegada de producto) | Evita visitas en vano | S | Escribir los avisos |
| C4 | Productos destacados definidos por Nicolás ("Hoy", "Recién llegado") | Destaca lo que quiere vender | S–M | Elegir qué destacar |
| C5 | Buscador y etiquetas de cocción (parrilla, horno, guiso, plancha) | Encontrar rápido el corte correcto | M | Etiquetar cortes |
| C6 | Calculadora de asado (personas → kilos y cortes) | Asesoría sin hablar; ideal fines de semana | M | Validar porciones por persona |
| C7 | Ficha de producto más útil: cómo pedirlo (grosor, picado, molido), porción típica, tip de cocción | Menos dudas; imagen de experto | M | Aportar los tips |
| C8 | Inglés completo (51 productos) | Turistas entienden el menú | S | Aprobar traducciones |
| C9 | Botón "Llamar" junto a WhatsApp y botón "Dejar una reseña en Google" | Más contacto y mejor reputación | S | Enlace de su ficha de Google |
| C10 | Guía visual de cortes (diagrama de la res, toque para ver el corte) | Educa y diferencia | L | Opcional |
| C11 | Instalar como app (PWA) y menú disponible sin señal | Útil en el Cajón, donde la señal falla | S–M | — |

### Para Nicolás y Gloria (panel)
| # | Idea | Qué gana | Esf. |
|---|---|---|---|
| P1 | Ajuste masivo de precios (+/− % o monto, por categoría, con vista previa) | Minutos en vez de una hora | M |
| P2 | "Precios actualizados el [fecha]" automático | Confianza del cliente | S |
| P3 | Horario por día con editor visual (alimenta C2) | Dejar de escribir texto largo | M |
| P4 | Historial de cambios y "restaurar versión anterior" (se apoya en el historial de GitHub) | Tranquilidad si se equivocan | M |
| P5 | Aviso si salen de la página con cambios sin guardar; borrador automático | Evita perder trabajo | S |
| P6 | Marcar "agotado hoy" y "volver a disponible todo" con un toque | Operación diaria rápida | S |
| P7 | Duplicar producto, reordenar arrastrando, importar desde Excel | Cargar o ajustar catálogo sin fricción | M |
| P8 | Cartel QR imprimible (mesón, bolsas, vitrina) con el logo | El QR llega a los clientes | S |
| P9 | Métricas simples: visitas por semana, productos más vistos, toques en WhatsApp | Demostrar el valor del menú | S–M |
| P10 | Panel de ayuda ("cómo subo una foto", "cómo cambio un precio") en 1 pantalla | Autonomía sin depender de nadie | S |

### Interfaz y diseño
| # | Mejora | Esf. |
|---|---|---|
| D1 | Placeholder de foto con la marca (en vez del emoji genérico) mientras faltan fotos | S |
| D2 | Tarjetas "foto primero" (grilla de 2 columnas) para los productos con foto; lista compacta para los que no | M |
| D3 | Tipografía de títulos que combine con el letrero retro del logo (probar 2–3 opciones y elegir con Nicolás) | S |
| D4 | Animación de "agregar al pedido" y barra inferior con el resumen (parte de C1) | S |
| D5 | Accesibilidad: foco visible, zonas táctiles de 44 px, respetar "reducir movimiento", control de teclado completo en los modales | M |
| D6 | Estados vacíos y de error más amables en todo el panel | S |
| D7 | Mejorar el panel en celular: acciones con el pulgar, barra fija con "Guardar" | M |
| D8 | Revisar el modo claro con fotos reales (contraste, sombras) | S |

### Técnico y robustez
| # | Mejora | Esf. |
|---|---|---|
| T1 | ✅ Rama única `main` (producción, panel y desarrollo usan la misma) — hecho el 2026-10-10 | S |
| T2 | GitHub Actions: en cada cambio correr pruebas, lint y compilación | S |
| T3 | Pruebas automáticas de pantalla (Playwright) para login, subir foto y guardar | M |
| T4 | Aviso automático cuando el token de GitHub esté por vencer (hoy solo se ve al probar) | S |
| T5 | Guardado con control de versiones (dos personas guardando a la vez no se pisan) | M |
| T6 | Reemplazar los efectos de carga de datos por una librería (SWR); el lint hoy lo marca como aviso | M |
| T7 | Monitoreo gratuito: chequeo de que el sitio responde y registro de errores | S |
| T8 | SEO local: título y descripción, datos estructurados "LocalBusiness" con las coordenadas, imagen al compartir | S–M |
| T9 | Fuente de Google en modo desarrollo con Turbopack (hoy `npm run dev` usa webpack) | S |
| T10 | Dependencias de desarrollo (Tailwind 3) → Tailwind 4 para cerrar los 9 avisos que quedan | M |

## 4. Plan por etapas

### Etapa 0 — Dejar en producción lo ya hecho (1 día)
Objetivo: que el sitio real tenga todas las correcciones y la ubicación nueva.

- [x] **0.1** Commit y push de todo lo hecho. La historia de `master` se unió a `main` con un commit
      de fusión (sin borrar historial) y `main` es ahora la **única rama**: el panel guarda en
      `main`, Vercel produce desde `main` y el código usa `main` por defecto.
- [x] **0.2** Producción en Vercel desde `main` (ya era la rama de producción; ahora el panel
      también guarda ahí, así que ya no puede volver a desalinearse).
- [x] **0.3** Entrar al panel real → Ajustes → **Probar conexiones**. *Hecho cuando* "Subida de
      fotos" y "Guardado del menú" salen en verde. Las fotos ya no usan Cloudinary: se guardan en
      el mismo repositorio (`data/images/`) con el mismo token de GitHub que guarda el menú.
- [x] **0.4** Subir una foto real desde el panel (hecho el 2026-10-10: la subida funciona en producción).
- [ ] **0.5** Seguridad (decide Nicolás/Cristian): el archivo `.env.local` ya no está en el código
      actual, pero **sigue en el historial público** (commit `474f9ce`). Conviene cambiar la
      contraseña y `AUTH_SECRET` en Vercel y dejar el repositorio privado. Es independiente del resto.
- [x] **0.6** Número de calle y pin: el pin cae en la puerta de la carnicería (confirmado por
      Cristian el 2026-10-10); el texto "Comercio 19881" se deja como está. La ficha de Google
      Business tiene la ubicación desfasada y se corrige después, como regalo para Nicolás.

### Etapa 1 — Contenido y confianza (1 semana, casi sin código)
- [ ] **1.1** Jornada de fotos (C: Nicolás): guía de 1 página (luz natural, fondo oscuro o madera,
      tabla limpia, 1 foto cenital por corte). Meta: las 36 que faltan, empezando por las 10
      más vendidas. → resuelve D1 parcialmente.
- [x] **1.2** Inglés completo (C8) — hecho: se prepara una propuesta de traducción de los 42 productos que
      faltan, Nicolás la revisa en una pasada.
- [x] **1.3** P2 "Precios actualizados el…", C9 botón Llamar y reseñas y C3 aviso de portada — hechos. *Pendiente de Nicolás:*
      darnos el teléfono para llamadas y el enlace de reseñas de su ficha de Google (se cargan en Ajustes).
- [ ] **1.4** D1 placeholder con marca (pendiente) — P10 mini-guía de ayuda en el panel: hecha.

*Cierre:* ≥ 80 % de productos con foto real, 100 % en inglés, aviso y fecha visibles.

### Etapa 2 — Convertir visitas en pedidos (1–2 semanas)
- [x] **2.1** C2 + P3: horario por día y "Abierto ahora" — hecho
- [x] **2.2** (hecho) C1 + D4: pedido por WhatsApp con kilos (pasos de 0,5 kg, nota por producto, total
      estimado, mensaje listo para enviar). *Hecho cuando* un pedido de prueba llega a WhatsApp con
      el formato correcto y los totales cuadran.
- [x] **2.3** C4 productos destacados y C5 buscador — hechos. *Pendiente de Nicolás:* elegir qué productos destacar.
- [x] **2.4** T4 aviso de vencimiento del token y T2 GitHub Actions — hechos.

*Cierre:* pedido de prueba completo desde un celular; Nicolás lo usa una semana y da feedback.

### Etapa 3 — Herramientas para el día a día (1 semana)
- [x] **3.1** P1 ajuste masivo de precios con vista previa — hecho
- [ ] **3.2** P4 historial y restaurar; P5 borrador y aviso de cambios sin guardar; P6 agotado hoy.
- [ ] **3.3** P8 cartel QR imprimible; P7 duplicar y reordenar.
- [ ] **3.4** T5 guardado con control de versiones.

### Etapa 4 — Diferenciadores (2–3 semanas)
- [ ] **4.1** ~~C6 calculadora de asado~~ (hecha) y C7 fichas con tips.
- [ ] **4.2** C11 PWA y T8 SEO local con datos estructurados.
- [ ] **4.3** D2 tarjetas "foto primero", D3 tipografía, D5 accesibilidad completa.
- [ ] **4.4** P9 métricas simples.
- [ ] **4.5** C10 guía visual de cortes (si Nicolás la quiere).

### Etapa 5 — Calidad continua
T3 pruebas de pantalla, T6 SWR, T7 monitoreo, T9/T10 herramientas de desarrollo, revisión
mensual del health check y del vencimiento del token.

## 5. Preguntas para Nicolás
1. ¿Hacen **entregas a domicilio** o solo retiro? ¿En qué zonas?
2. ¿Aceptan **encargos con anticipación** (parrillada del sábado, Fiestas Patrias, Navidad)?
3. ¿Tienen **Instagram, Facebook o ficha de Google**? (la ficha de Google probablemente tenga el
   mismo error de ubicación que había en el footer).
4. ¿Cuál es el **número correcto** de la calle Comercio?
5. ¿Qué **cortes quieren destacar** y cuáles se agotan primero?
6. ¿Hay **horarios especiales** o feriados conocidos para este año?
7. ¿Quieren que el menú muestre el **peso aproximado por pieza** (ej. "pollo entero ≈ 2,2 kg")?
8. ¿Les sirve un **cartel QR** para el mesón y las bolsas? ¿Con qué texto?

## 6. Cómo trabajamos cada tarea
1. Se redacta la prueba o el criterio de "hecho" (arriba).
2. Se implementa en pequeño y se corren `npm test`, `npm run lint` y `npm run build`.
3. Se verifica en el navegador (celular, modo oscuro y claro).
4. Se sube a `main`; el panel **Probar conexiones** confirma que producción sigue sana.
