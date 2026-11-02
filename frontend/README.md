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
| `src/App.vue` | Onboarding, registro, login y sesión. Los textos del onboarding están en `paginas`. |
| `src/style.css` | Fuentes y estilos del onboarding y de acceso. |
| `src/components/Inicio.vue` | Categorías y navegación del inicio. |
| `src/datos/categorias.js` | Nombres, fotos y detalles de las categorías. También alimenta el selector del formulario. |
| `src/components/ProductosInicio.vue` | Carruseles de productos de muestra. |
| `src/components/PersonasInicio.vue` | Tarjetas de personas de muestra. |
| `src/components/CrearProducto.vue` | Formulario y vista previa de un producto. |
| `src/supabase.js` | Cliente compartido de Supabase. |
| `src/assets/` | Fotos, fuentes y logos en archivos SVG. |

Los estilos de cada componente están al final de su archivo, dentro de `<style scoped>`.

## Qué funciona y qué falta

- **Registro:** crea la cuenta en Supabase Auth y solicita confirmar el correo.
- **Login:** valida correo y contraseña, abre el inicio y restaura la sesión al volver a entrar.
- **Cerrar sesión:** cierra el acceso del navegador actual.
- **Crear producto:** permite completar los campos, elegir una foto y revisar una vista previa. Todavía no guarda en la tabla de productos ni sube fotos a Storage.
- **Pendiente:** conectar productos reales, publicar, editar y eliminar productos, perfil y pedidos.
- Apple, Google y recuperación de contraseña todavía no están conectados.

Los precios, personas, cantidades y publicaciones del inicio son datos de muestra. No indican cercanía ni popularidad calculadas.

## Para conectar productos

Trabajar en `CrearProducto.vue`, usando el cliente exportado por `src/supabase.js`. El formulario agrupa sus campos en `datos`. La foto actual es una URL temporal para la vista previa; hay que conservar el archivo elegido para subirlo a Storage.

La integración debe usar la sesión del usuario y las tablas, funciones y políticas acordadas en Supabase. Este cambio de interfaz no modifica la base de datos.

En Supabase, las direcciones de confirmación de correo deben permitir el sitio publicado y los orígenes locales que se usen para probar.

## Preparar una publicación

```sh
npm run build
```

Vite genera `dist/`. Para Netlify se sube **el contenido de `dist`**, no `src` ni `node_modules`. La carpeta generada y las copias de respaldo no se guardan en Git.
