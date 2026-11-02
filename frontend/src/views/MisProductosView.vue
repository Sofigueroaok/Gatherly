<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase.js'

const route = useRoute()
const router = useRouter()
const productos = ref([])
const cargando = ref(true)
const eliminando = ref(null)
const errorMsg = ref('')
const mensaje = ref(route.query.guardado ? 'Tu publicación se guardó correctamente.' : '')
if (route.query.fotoPendiente) mensaje.value += ' No pudimos limpiar la foto anterior.'

const obtenerProductos = async () => {
  try {
    cargando.value = true
    errorMsg.value = ''
    const { data: { user }, error: errorUsuario } = await supabase.auth.getUser()
    if (errorUsuario) throw errorUsuario
    if (!user) throw new Error('Primero iniciá sesión.')
    const { data, error } = await supabase.from('producto')
      .select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (error) throw error
    productos.value = data
  } catch (err) {
    errorMsg.value = `No se pudieron cargar tus publicaciones: ${err.message}`
  } finally {
    cargando.value = false
  }
}

// DELETE: confirmar, borrar en Supabase y actualizar la lista con filter.
const eliminarProducto = async (producto) => {
  if (eliminando.value || !confirm(`¿Querés eliminar “${producto.nombre}”?`)) return
  try {
    eliminando.value = producto.id_producto
    errorMsg.value = ''
    mensaje.value = ''
    const { data: { user }, error: errorUsuario } = await supabase.auth.getUser()
    if (errorUsuario) throw errorUsuario
    if (!user) throw new Error('Primero iniciá sesión.')
    const { data, error } = await supabase.from('producto').delete()
      .eq('id_producto', producto.id_producto).eq('user_id', user.id).select('id_producto')
    if (error) throw error
    if (!data.length) throw new Error('No se eliminó el producto. Revisá los permisos de la cuenta.')
    productos.value = productos.value.filter(item => item.id_producto !== producto.id_producto)
    mensaje.value = 'Publicación eliminada.'

    if (producto.foto_ruta?.startsWith(`${user.id}/`)) {
      const { error } = await supabase.storage.from('productos').remove([producto.foto_ruta])
      if (error) mensaje.value += ' La foto quedó pendiente de limpieza.'
    }
  } catch (err) {
    errorMsg.value = `No se pudo eliminar: ${err.message}`
  } finally {
    eliminando.value = null
  }
}

onMounted(obtenerProductos)
</script>

<template>
  <section class="mis-productos">
    <header class="mis-encabezado">
      <button type="button" @click="router.push({ name: 'inicio' })">← Inicio</button>
      <span>TU ESPACIO</span>
    </header>
    <h1>Mis publicaciones.</h1>
    <p class="mis-bajada">Todo eso que tenés para compartir.</p>
    <button class="mis-publicar" type="button" @click="router.push({ name: 'publicar' })">Publicar otro objeto <span>+</span></button>
    <p v-if="mensaje" class="mis-mensaje" role="status">{{ mensaje }}</p>
    <p v-if="errorMsg" class="mis-error" role="alert">{{ errorMsg }}</p>
    <p v-if="cargando" role="status">Cargando tus publicaciones…</p>
    <p v-else-if="!errorMsg && !productos.length">Todavía no tenés publicaciones.</p>

    <div class="mis-lista">
      <article v-for="producto in productos" :key="producto.id_producto" class="mi-producto">
        <img :src="producto.foto" :alt="producto.nombre || 'Producto publicado'" loading="lazy" />
        <div class="mi-contenido">
          <h2>{{ producto.nombre || 'Producto publicado' }}</h2>
          <p>{{ Number(producto.precio).toLocaleString('es-AR') }} ARS / día</p>
          <p>{{ producto.ubicacion }}</p>
          <div class="mi-acciones">
            <button type="button" :disabled="!!eliminando" @click="router.push({ name: 'editar-producto', params: { id: producto.id_producto } })">Editar</button>
            <button type="button" class="mi-eliminar" :disabled="!!eliminando" @click="eliminarProducto(producto)">{{ eliminando === producto.id_producto ? 'Eliminando…' : 'Eliminar' }}</button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.mis-productos { padding: 22px 22px 45px; min-height: 100svh; color: #211c18; background: #f5efdf; font: 14px/1.3 'SF Regular', sans-serif; }
.mis-encabezado { display: flex; justify-content: space-between; align-items: center; margin-bottom: 36px; }
.mis-encabezado > span { font: 10px 'Space Grotesk', sans-serif; letter-spacing: .07em; }
.mis-encabezado button { min-height: 44px; border: 0; background: none; color: inherit; padding: 10px 0; }
h1 { font: 28px/1.03 'ITC Avant Medium', sans-serif; letter-spacing: -.055em; margin: 12px 0; }
.mis-bajada { margin: 0 0 27px; }
.mis-publicar { display: flex; justify-content: space-between; align-items: center; width: 100%; min-height: 50px; padding: 15px 18px; background: #bb592f; color: white; border: 0; border-radius: 3px; }
.mis-mensaje { padding: 12px; background: #e9dfcc; }
.mis-error { color: #9e2c19; }
.mis-lista { display: grid; gap: 20px; margin-top: 24px; }
.mi-producto { display: flex; gap: 13px; padding-bottom: 20px; border-bottom: 1px solid #cabcaa; }
.mi-producto > img { width: 100px; height: 110px; object-fit: cover; border-radius: 3px; }
.mi-contenido { min-width: 0; flex: 1; }
.mi-contenido h2 { font: 16px/1.15 'SF Medium', sans-serif; margin: 0 0 8px; overflow-wrap: anywhere; }
.mi-contenido p { font-size: 12px; margin: 5px 0; }
.mi-acciones { display: flex; gap: 10px; flex-wrap: wrap; }
.mi-acciones button { min-height: 44px; border: 0; background: none; padding: 8px 0; color: inherit; text-decoration: underline; }
.mi-acciones .mi-eliminar { color: #9e2c19; }
button:disabled { opacity: .6; cursor: wait; }
</style>
