<script setup>
import { computed, ref, onMounted } from 'vue'
import { supabase } from '../supabase.js'
import anafe from '../assets/productos.images/ANAFE.png'
import taladro from '../assets/productos.images/TALADRO.png'
import binoculares from '../assets/productos.images/BINOCULARES.png'
import proyector from '../assets/productos.images/PROYECTOR.png'
import telescopio from '../assets/productos.images/TELESCOPIO.png'
import maquina from '../assets/productos.images/MAQUINADECOSER.png'

const filas = ref([])

// Datos de muestra para revisar el diseño antes de conectar las publicaciones.
const seccionesEjemplo = [
  {
    nombre: 'Cerca tuyo', muestra: true,
    productos: [
      { nombre: 'Anafe portátil de camping Coleman', foto: anafe, precio: '8.000', persona: 'Gerónimo' },
      { nombre: 'Taladro percutor Bosch', foto: taladro, precio: '7.500', persona: 'Alberto' },
      { nombre: 'Proyector para cine en casa', foto: proyector, precio: '10.000', persona: 'Julia' }
    ]
  },
  {
    nombre: 'Populares este mes',
    productos: [
      { nombre: 'Binoculares para tus aventuras', foto: binoculares, precio: '6.500', persona: 'Tobías' },
      { nombre: 'Telescopio astronómico con trípode', foto: telescopio, precio: '12.000', persona: 'Martín' },
      { nombre: 'Máquina de coser Janome', foto: maquina, precio: '9.000', persona: 'Graciela' }
    ]
  }
]

const productos = ref([])
const cargando = ref(true)
const errorMsg = ref('')
const secciones = computed(() => [
  { nombre: 'Recién publicados', productos: productos.value, real: true },
  ...seccionesEjemplo
])

// READ: el catálogo real se obtiene de Supabase al montar la vista.
const obtenerProductos = async () => {
  try {
    cargando.value = true
    errorMsg.value = ''
    const { data, error } = await supabase.from('producto')
      .select('*').order('created_at', { ascending: false })
    if (error) throw error
    productos.value = data.map(producto => ({
      ...producto,
      nombre: producto.nombre || producto.descripcion || 'Producto publicado',
      precio: Number(producto.precio).toLocaleString('es-AR')
    }))
  } catch (err) {
    errorMsg.value = `No se pudieron cargar las publicaciones: ${err.message}`
  } finally {
    cargando.value = false
  }
}
onMounted(obtenerProductos)

function avanzar(indice) {
  const fila = filas.value[indice]
  if (!fila) return
  const alFinal = fila.scrollLeft + fila.clientWidth >= fila.scrollWidth - 2
  fila.scrollTo({ left: alFinal ? 0 : fila.scrollLeft + fila.clientWidth * .74, behavior: 'smooth' })
}
</script>

<template>
  <div class="productos-inicio">

    <section v-for="(seccion, indice) in secciones" :key="seccion.nombre" class="productos-seccion" :aria-labelledby="`productos-titulo-${indice}`">
      <p v-if="seccion.muestra" class="productos-muestra">Publicaciones de muestra</p>
      <header class="productos-encabezado">
        <h2 :id="`productos-titulo-${indice}`">{{ seccion.nombre }}</h2>
        <button type="button" :aria-label="`Deslizar productos de ${seccion.nombre}`" @click="avanzar(indice)">→</button>
      </header>

      <template v-if="seccion.real">
        <p v-if="cargando" class="productos-estado" role="status">Cargando publicaciones…</p>
        <p v-else-if="errorMsg" class="productos-estado productos-error" role="alert">{{ errorMsg }}</p>
        <p v-else-if="!productos.length" class="productos-estado">Todavía no hay objetos publicados.</p>
      </template>
      <ul :ref="elemento => filas[indice] = elemento" class="productos-carrusel" :aria-label="seccion.nombre" tabindex="0">
        <li v-for="producto in seccion.productos" :key="producto.nombre" class="producto-tarjeta">
          <article>
            <div class="producto-foto">
              <img :src="producto.foto" :alt="producto.nombre" loading="lazy" width="450" height="300" />
              <span class="producto-etiqueta">Alquiler</span>
              <span class="producto-precio">{{ producto.precio }} ARS <small>/ día</small></span>
            </div>
            <h3>{{ producto.nombre }}</h3>
            <p v-if="producto.persona" class="producto-persona"><span class="producto-avatar" aria-hidden="true">{{ producto.persona.charAt(0) }}</span>{{ producto.persona }} <span aria-hidden="true">·</span> A coordinar</p>
            <p v-else class="producto-persona">{{ producto.ubicacion || 'Retiro a coordinar' }}</p>
          </article>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.productos-inicio { background: #fffdf7; padding: 25px 0 20px; }
.productos-estado { padding: 0 22px; font: 13px/1.4 'SF Regular', sans-serif; }
.productos-error { color: #9e2c19; }
.productos-muestra { margin: 0 22px 12px; color: #6b6256; font: 11px 'SF Regular', sans-serif; }
.productos-seccion { margin-bottom: 24px; }
.productos-encabezado { display: flex; justify-content: space-between; align-items: center; padding: 0 22px; margin-bottom: 9px; }
.productos-encabezado h2 { font: 11px 'Space Grotesk', sans-serif; text-transform: uppercase; margin: 0; }
.productos-encabezado button { background: none; border: 0; color: inherit; font: 20px 'SF Regular', sans-serif; min-width: 44px; min-height: 44px; padding: 0; }
.productos-carrusel { display: flex; gap: 12px; padding: 0 22px 5px; margin: 0; overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x mandatory; scroll-padding-inline: 22px; list-style: none; scrollbar-width: none; }
.productos-carrusel::-webkit-scrollbar { display: none; }
.producto-tarjeta { flex: 0 0 72%; min-width: 0; scroll-snap-align: start; }
.producto-foto { position: relative; aspect-ratio: 3 / 2; overflow: hidden; border-radius: 3px; background: #e5dfd2; }
.producto-foto img { display: block; width: 100%; height: 100%; object-fit: cover; }
.producto-etiqueta { position: absolute; top: 6px; left: 6px; background: #bb592f; color: white; padding: 3px 5px; font: 10px 'SF Regular', sans-serif; }
.producto-precio { position: absolute; bottom: 6px; left: 6px; color: white; padding: 3px 5px; background: #29251cc4; font: 11px 'SF Regular', sans-serif; }
.producto-precio small { font-size: inherit; }
.producto-tarjeta h3 { margin: 10px 0 7px; min-height: 32px; font: 14px/1.15 'SF Regular', sans-serif; letter-spacing: -.02em; }
.producto-persona { display: flex; align-items: center; gap: 5px; margin: 0; font: 11px 'SF Regular', sans-serif; color: #675e52; }
.producto-avatar { display: grid; place-items: center; width: 21px; height: 21px; border-radius: 50%; background: #ded4bd; color: #453b2e; font-size: 10px; }
@media (prefers-reduced-motion: reduce) { .productos-carrusel { scroll-behavior: auto; } }
</style>
