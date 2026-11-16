# Gatherly · Interfaz

Aplicación en Vue 3 y Vite. El código que usamos está en `frontend/`.

## Abrir el proyecto

Desde una terminal en `frontend`:

```sh
npm ci
```

Copiar `.env.example` como `.env.local` y completar la URL del proyecto y su clave **pública** de Supabase:

```dotenv
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu-clave-publica
```

El archivo `.env.local` queda fuera de Git. No se necesita una clave secreta ni `service_role`.

```sh
npm run dev -- --host
```

Abrir la dirección `Local` en la computadora. Para probar desde un celular conectado al mismo Wi-Fi, usar la dirección `Network` que muestra la terminal.

## Dónde modificar cada parte

| Archivo | Qué contiene |
| --- | --- |
| `src/App.vue` | Contenedor de las pantallas del router. |
| `src/router/index.js` | Rutas y control de sesión antes de entrar (clase 11). |
| `src/views/AccesoView.vue` | Onboarding, registro y login. Los textos están en `paginas`. |
| `src/views/InicioView.vue` | Usuario conectado y cierre de sesión. |
| `src/views/MisProductosView.vue` | Listar, editar y eliminar publicaciones propias. |
| `src/style.css` | Fuentes y estilos del onboarding y de acceso. |
| `src/components/Inicio.vue` | Categorías y navegación del inicio. |
| `src/datos/categorias.js` | Nombres, fotos y detalles de las categorías. El formulario carga las categorías de Supabase. |
| `src/components/ProductosInicio.vue` | Publicaciones de Supabase y carruseles de muestra identificados. |
| `src/components/PersonasInicio.vue` | Tarjetas de personas de muestra. |
| `src/components/CrearProducto.vue` | Formulario, vista previa, subida de foto y creación/edición en Supabase. |
| `src/supabase.js` | Cliente compartido de Supabase. |
| `src/assets/` | Fotos, fuentes y logos en archivos SVG. |

Los estilos de cada componente están al final de su archivo, dentro de `<style scoped>`.

## Qué funciona y qué falta

- **Registro:** crea la cuenta en Supabase Auth y solicita confirmar el correo.
- **Login:** valida correo y contraseña, abre el inicio y restaura la sesión al volver a entrar.
- **Cerrar sesión:** cierra el acceso del navegador actual.
- **Productos:** crear, listar, editar y eliminar en la tabla `producto`, con fotos en el bucket `productos`.
- **Administrar:** en Mi cuenta → Mis publicaciones aparecen los objetos del usuario conectado.
- **Pendiente:** perfil editable y pedidos; Apple, Google y recuperación de contraseña no están conectados.

Los carruseles marcados como muestra y las personas usan datos de ejemplo. No indican cercanía ni popularidad calculadas. La sección Recién publicados carga datos reales.

## Base de datos y clases

El SQL de publicaciones se aplica una sola vez en Supabase. Agrega a `producto` los campos `user_id`, `nombre`, `ubicacion`, `foto_ruta` y `created_at`, las políticas de acceso y el bucket de fotos. Conserva las filas existentes y no modifica `usuario`.

`user_id` guarda el identificador de Supabase Auth. La tabla antigua `usuario` tiene un identificador numérico distinto: todavía no se usa como perfil de la cuenta.

La clase 9 usa `select`, `insert`, `update`, `delete`, `ref`, `onMounted` y políticas con `auth.uid()`. La clase 11 usa `signUp`, `signInWithPassword`, `getSession`, `signOut` y `router.beforeEach`. La subida de archivos a Storage complementa esos ejemplos; no es una copia literal de la práctica de tareas.

Cada cuenta puede modificar y eliminar solamente sus productos; los usuarios conectados pueden leer el catálogo. Las fotos publicadas son públicas. No subir imágenes privadas.

En Supabase, las direcciones de confirmación deben permitir el sitio publicado y las direcciones locales que se usen para probar.

Para comprobarlo: iniciar sesión, publicar un objeto, revisar que aparezca en Mis publicaciones y en la tabla `producto`, recargar la página, editarlo y eliminarlo. La verificación con cuentas reales se hace aparte de las pruebas locales.

## Preparar una publicación

```sh
npm run build
```

Vite genera `dist/`. Para Netlify se sube **el contenido de `dist`**, no `src` ni `node_modules`. La carpeta generada y las copias de respaldo no se guardan en Git.
