<script setup>
import { computed, onMounted, onBeforeUnmount, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase.js'

const route = useRoute()
const router = useRouter()
const editando = computed(() => route.name === 'editar-producto')
const datos = reactive({ nombre: '', categoria: '', descripcion: '', precio: '', ubicacion: '' })
const categorias = ref([])
const foto = ref('')
const archivoFoto = ref(null)
const fotoAnterior = ref('')
const rutaAnterior = ref('')
const errorFoto = ref('')
const errorMsg = ref('')
const cargando = ref(true)
const enviando = ref(false)
const vistaPrevia = ref(false)
const nombreCategoria = computed(() => categorias.value.find(c => c.id_categoria === datos.categoria)?.nombre || '')

// READ: cargar categorías y, al editar, el producto del usuario conectado.
const cargarFormulario = async () => {
  try {
    cargando.value = true
    errorMsg.value = ''
    const { data, error } = await supabase.from('categoria').select('*').order('id_categoria')
    if (error) throw error
    categorias.value = data

    if (editando.value) {
      const { data: { user }, error: errorUsuario } = await supabase.auth.getUser()
      if (errorUsuario) throw errorUsuario
      if (!user) throw new Error('Primero iniciá sesión.')
      const { data: producto, error: errorProducto } = await supabase.from('producto')
        .select('*').eq('id_producto', route.params.id).eq('user_id', user.id).single()
      if (errorProducto) throw errorProducto
      Object.assign(datos, {
        nombre: producto.nombre, categoria: producto.id_categoria,
        descripcion: producto.descripcion, precio: producto.precio, ubicacion: producto.ubicacion
      })
      foto.value = fotoAnterior.value = producto.foto
      rutaAnterior.value = producto.foto_ruta || ''
    }
  } catch (err) {
    errorMsg.value = `No se pudo cargar el formulario: ${err.message}`
  } finally {
    cargando.value = false
  }
}

function elegirFoto(evento) {
  const archivo = evento.target.files?.[0]
  if (!archivo) return
  errorFoto.value = ''
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type) || archivo.size > 5 * 1024 * 1024) {
    errorFoto.value = 'Elegí una foto JPG, PNG o WebP de hasta 5 MB.'
    evento.target.value = ''
    return
  }
  if (foto.value.startsWith('blob:')) URL.revokeObjectURL(foto.value)
  archivoFoto.value = archivo
  foto.value = URL.createObjectURL(archivo)
}

function revisar() {
  if (cargando.value || enviando.value) return
  if (!foto.value) {
    errorFoto.value = 'Agregá una foto de tu producto.'
    return
  }
  vistaPrevia.value = true
  errorMsg.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// CREATE / UPDATE: mismo patrón de la clase 9, con Storage para la foto.
const guardarProducto = async () => {
  if (enviando.value) return
  let rutaNueva = ''
  let guardado = false
  try {
    enviando.value = true
    errorMsg.value = ''
    const { data: { user }, error: errorUsuario } = await supabase.auth.getUser()
    if (errorUsuario) throw errorUsuario
    if (!user) throw new Error('Primero iniciá sesión.')

    let fotoUrl = fotoAnterior.value
    let fotoRuta = rutaAnterior.value
    if (archivoFoto.value) {
      const extensiones = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
      rutaNueva = `${user.id}/${Date.now()}.${extensiones[archivoFoto.value.type]}`
      const { error } = await supabase.storage.from('productos').upload(rutaNueva, archivoFoto.value)
      if (error) throw error
      fotoUrl = supabase.storage.from('productos').getPublicUrl(rutaNueva).data.publicUrl
      fotoRuta = rutaNueva
    }

    const producto = {
      nombre: datos.nombre, descripcion: datos.descripcion,
      precio: String(datos.precio), id_categoria: datos.categoria,
      ubicacion: datos.ubicacion, foto: fotoUrl, foto_ruta: fotoRuta, user_id: user.id
    }
    const consulta = editando.value
      ? supabase.from('producto').update(producto).eq('id_producto', route.params.id).eq('user_id', user.id)
      : supabase.from('producto').insert([producto])
    const { data, error } = await consulta.select()
    if (error) throw error
    if (!data?.length) throw new Error('No se guardó el producto. Revisá los permisos de la cuenta.')
    guardado = true

    // Si cambió la foto, borrar la anterior después de guardar correctamente.
    let fotoPendiente = false
    if (rutaNueva && rutaAnterior.value.startsWith(`${user.id}/`)) {
      const { error } = await supabase.storage.from('productos').remove([rutaAnterior.value])
      fotoPendiente = !!error
    }
    router.replace({ name: 'mis-publicaciones', query: { guardado: '1', ...(fotoPendiente ? { fotoPendiente: '1' } : {}) } })
  } catch (err) {
    errorMsg.value = `No se pudo guardar el producto: ${err.message}`
    // Si no se guardó la fila, intentar limpiar la foto recién subida.
    if (rutaNueva && !guardado) {
      const { error } = await supabase.storage.from('productos').remove([rutaNueva])
      if (error) errorMsg.value += ' La foto quedó pendiente de limpieza.'
    }
  } finally {
    enviando.value = false
  }
}

onMounted(cargarFormulario)
onBeforeUnmount(() => { if (foto.value.startsWith('blob:')) URL.revokeObjectURL(foto.value) })
</script>

<template>
  <section class="crear-producto">
    <header class="crear-encabezado">
      <button type="button" :disabled="enviando" @click="vistaPrevia ? vistaPrevia = false : router.push({ name: 'inicio' })">← {{ vistaPrevia ? 'Editar' : 'Inicio' }}</button>
      <span>{{ vistaPrevia ? 'VISTA PREVIA' : editando ? 'EDITAR PUBLICACIÓN' : 'NUEVA PUBLICACIÓN' }}</span>
    </header>

    <template v-if="!vistaPrevia">
      <p class="crear-antetitulo">DALE OTROS PLANES A TUS COSAS.</p>
      <h1>Eso que tenés.<br />Eso que alguien necesita.</h1>
      <p class="crear-bajada">Contanos qué vas a compartir. Los buenos objetos merecen más de una historia.</p>

      <form class="crear-formulario" @submit.prevent="revisar">
        <label class="crear-foto">
          <img v-if="foto" :src="foto" alt="Foto elegida para tu producto" />
          <span v-else class="crear-foto-simbolo" aria-hidden="true">+</span>
          <span>{{ foto ? 'Cambiar foto' : 'Agregá una foto' }}</span>
          <small>JPG, PNG o WebP · hasta 5 MB</small>
          <input type="file" accept="image/jpeg,image/png,image/webp" @change="elegirFoto" />
        </label>
        <p v-if="errorFoto" class="crear-error" role="alert">{{ errorFoto }}</p>

        <label for="producto-nombre">¿QUÉ VAS A COMPARTIR?</label>
        <input id="producto-nombre" v-model.trim="datos.nombre" placeholder="Ej.: Cámara analógica Canon" required maxlength="90" />

        <label for="producto-categoria">CATEGORÍA</label>
        <select id="producto-categoria" v-model="datos.categoria" required>
          <option disabled value="">Elegí una categoría</option>
          <option v-for="categoria in categorias" :key="categoria.id_categoria" :value="categoria.id_categoria">{{ categoria.nombre }}</option>
        </select>

        <label for="producto-descripcion">CONTANOS UN POCO MÁS</label>
        <textarea id="producto-descripcion" v-model.trim="datos.descripcion" placeholder="Cómo está, qué incluye y qué hay que saber para usarlo." required maxlength="1500" rows="4"></textarea>

        <label for="producto-precio">PRECIO POR DÍA · ARS</label>
        <input id="producto-precio" v-model="datos.precio" type="number" inputmode="decimal" min="1" max="99999999" step="0.01" placeholder="Ej.: 5000" required />

        <label for="producto-ubicacion">¿POR DÓNDE SE RETIRA?</label>
        <input id="producto-ubicacion" v-model.trim="datos.ubicacion" placeholder="Tu barrio o localidad" required maxlength="100" />

        <button class="crear-principal" type="submit" :disabled="cargando || enviando || !categorias.length">Ver vista previa <span aria-hidden="true">→</span></button>
      </form>
    </template>

    <template v-else>
      <p class="crear-antetitulo">ASÍ SE VERÍA TU PUBLICACIÓN.</p>
      <article class="producto-previa">
        <img :src="foto" :alt="datos.nombre" />
        <div>
          <p class="crear-antetitulo">{{ nombreCategoria }}</p>
          <h1>{{ datos.nombre }}</h1>
          <p class="producto-precio">{{ Number(datos.precio).toLocaleString('es-AR') }} ARS <small>/ día</small></p>
          <p class="producto-ubicacion">{{ datos.ubicacion }}</p>
          <p class="producto-descripcion">{{ datos.descripcion }}</p>
        </div>
      </article>
      <button class="crear-principal" type="button" :disabled="enviando" :aria-busy="enviando" @click="guardarProducto">
        {{ enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Publicar producto' }} <span aria-hidden="true">→</span>
      </button>
      <button class="crear-editar" type="button" :disabled="enviando" @click="vistaPrevia = false">Seguir editando</button>
    </template>
    <p v-if="cargando" class="crear-nota" role="status">Cargando datos…</p>
    <p v-if="errorMsg" class="crear-error" role="alert">{{ errorMsg }}</p>
  </section>
</template>

<style scoped>
.crear-producto { padding: 22px 22px 40px; min-height: 100svh; background: #f5efdf; color: #211c18; }
.crear-encabezado { display: flex; justify-content: space-between; align-items: center; margin-bottom: 36px; gap: 12px; }
.crear-encabezado button { color: inherit; -webkit-text-fill-color: currentColor; border: 0; background: none; padding: 10px 0; min-height: 44px; font: 14px 'SF Regular', sans-serif; }
.crear-encabezado > span, .crear-antetitulo { font: 10px 'Space Grotesk', sans-serif; letter-spacing: .07em; }
h1 { font: 28px/1.03 'ITC Avant Medium', sans-serif; letter-spacing: -.055em; margin: 12px 0; }
.crear-bajada { font: 14px/1.3 'SF Regular', sans-serif; letter-spacing: -.01em; max-width: 320px; margin-bottom: 27px; }
.crear-formulario { display: flex; flex-direction: column; }
.crear-foto { display: flex; align-items: center; justify-content: center; flex-direction: column; min-height: 195px; position: relative; border: 1px dashed #9f8d77; background: #e9decb; overflow: hidden; margin-bottom: 24px; padding: 20px; gap: 6px; font: 15px 'SF Regular', sans-serif; }
.crear-foto-simbolo { font: 38px 'SF Light', sans-serif; }
.crear-foto small { font-size: 11px; }
.crear-foto img { width: 100%; height: 160px; object-fit: contain; }
.crear-foto input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
.crear-foto:focus-within { outline: 2px solid #bb592f; outline-offset: 3px; }
.crear-formulario > label:not(.crear-foto) { font: 11px 'Space Grotesk', sans-serif; margin: 0 0 8px; }
.crear-formulario > input, select, textarea { width: 100%; font: 16px/1.3 'SF Regular', sans-serif; letter-spacing: -.01em; color: #211c18; border: 1px solid #cabcaa; border-radius: 3px; background: #ffffff60; padding: 14px 12px; margin-bottom: 23px; }
textarea { resize: vertical; }
.crear-principal { display: flex; justify-content: space-between; align-items: center; width: 100%; min-height: 50px; background: #bb592f; color: white; padding: 15px 18px; border: 0; border-radius: 3px; font: 14px 'SF Medium', sans-serif; }
.crear-editar { display: block; margin: 12px auto 0; min-height: 44px; border: 0; background: none; color: inherit; font: 14px 'SF Regular', sans-serif; text-decoration: underline; }
button:disabled { opacity: .6; cursor: wait; }
.crear-nota { font: 12px/1.4 'SF Regular', sans-serif; color: #665749; }
.crear-error { color: #9e2c19; font: 13px 'SF Regular', sans-serif; }
.producto-previa { margin: 22px 0 28px; }
.producto-previa > img { width: 100%; max-height: 370px; object-fit: cover; }
.producto-previa > div { padding: 14px 0; }
.producto-precio { font: 22px 'SF Medium', sans-serif; }
.producto-precio small { font-size: 13px; }
.producto-ubicacion, .producto-descripcion { font: 15px/1.4 'SF Regular', sans-serif; white-space: pre-wrap; overflow-wrap: anywhere; }
</style>
