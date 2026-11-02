<script setup>
import { ref } from 'vue'
import anafe from '../assets/productos.images/ANAFE.png'
import taladro from '../assets/productos.images/TALADRO.png'
import binoculares from '../assets/productos.images/BINOCULARES.png'
import proyector from '../assets/productos.images/PROYECTOR.png'
import telescopio from '../assets/productos.images/TELESCOPIO.png'
import maquina from '../assets/productos.images/MAQUINADECOSER.png'

const filas = ref([])

// Datos de muestra para revisar el diseño antes de conectar las publicaciones.
const secciones = [
  {
    nombre: 'Cerca tuyo',
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

function avanzar(indice) {
  const fila = filas.value[indice]
  if (!fila) return
  const alFinal = fila.scrollLeft + fila.clientWidth >= fila.scrollWidth - 2
  fila.scrollTo({ left: alFinal ? 0 : fila.scrollLeft + fila.clientWidth * .74, behavior: 'smooth' })
}
</script>

<template>
  <div class="productos-inicio">
    <p class="productos-muestra">Publicaciones de muestra</p>

    <section v-for="(seccion, indice) in secciones" :key="seccion.nombre" class="productos-seccion" :aria-labelledby="`productos-titulo-${indice}`">
      <header class="productos-encabezado">
        <h2 :id="`productos-titulo-${indice}`">{{ seccion.nombre }}</h2>
        <button type="button" :aria-label="`Deslizar productos de ${seccion.nombre}`" @click="avanzar(indice)">→</button>
      </header>

      <ul :ref="elemento => filas[indice] = elemento" class="productos-carrusel" :aria-label="seccion.nombre" tabindex="0">
        <li v-for="producto in seccion.productos" :key="producto.nombre" class="producto-tarjeta">
          <article>
            <div class="producto-foto">
              <img :src="producto.foto" :alt="producto.nombre" loading="lazy" width="450" height="300" />
              <span class="producto-etiqueta">Alquiler</span>
              <span class="producto-precio">{{ producto.precio }} ARS <small>/ día</small></span>
            </div>
            <h3>{{ producto.nombre }}</h3>
            <p class="producto-persona"><span class="producto-avatar" aria-hidden="true">{{ producto.persona.charAt(0) }}</span>{{ producto.persona }} <span aria-hidden="true">·</span> A coordinar</p>
          </article>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.productos-inicio { background: #fffdf7; padding: 25px 0 20px; }
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
