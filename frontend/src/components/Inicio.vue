<script setup>
import { ref } from 'vue'
import CrearProducto from './CrearProducto.vue'
import ProductosInicio from './ProductosInicio.vue'
import PersonasInicio from './PersonasInicio.vue'
import { categorias } from '../datos/categorias.js'

defineProps({ usuario: { type: Object, required: true }, cerrando: Boolean, errorSesion: String })
defineEmits(['cerrar-sesion'])
const seccion = ref('inicio')
const categoriaActiva = ref(0)
const carrusel = ref(null)

function actualizarCategoria() {
  const elemento = carrusel.value
  if (elemento) categoriaActiva.value = Math.round(elemento.scrollLeft / elemento.clientWidth)
}
function irCategoria(indice) {
  carrusel.value?.scrollTo({ left: indice * carrusel.value.clientWidth, behavior: 'smooth' })
}
function navegar(destino) {
  seccion.value = destino
  window.scrollTo({ top: 0, behavior: 'instant' })
}
</script>

<template>
  <CrearProducto v-if="seccion === 'crear'" @volver="navegar('inicio')" />
  <div v-else class="inicio">
    <template v-if="seccion === 'inicio'">
      <header class="inicio-header">
        <span class="inicio-marca">Gatherly<sup>©</sup></span>
      </header>

      <section class="categorias" aria-label="Explorá las categorías">
        <div ref="carrusel" class="categorias-carrusel" @scroll.passive="actualizarCategoria">
          <article v-for="(categoria, indice) in categorias" :key="categoria.nombre" class="categoria" :style="{ '--categoria-acento': categoria.acento }" :aria-label="categoria.nombre">
            <img :src="categoria.imagen" alt="" :loading="indice === 0 ? 'eager' : 'lazy'" />
            <div class="categoria-texto">
              <div class="categoria-folio"><span>CATEGORÍA</span><span>0{{ indice + 1 }} / {{ String(categorias.length).padStart(2, '0') }}</span></div>
              <h1><span v-for="linea in categoria.titulo" :key="linea">{{ linea }}</span></h1>
              <ul class="categoria-detalles" aria-label="Qué podés encontrar">
                <li v-for="detalle in categoria.detalles" :key="detalle">{{ detalle }}</li>
              </ul>
            </div>
          </article>
        </div>
        <div class="categorias-controles">
          <div class="categorias-puntos" aria-label="Elegir categoría">
            <button v-for="(categoria, indice) in categorias" :key="categoria.nombre" type="button" :aria-label="categoria.nombre" :aria-pressed="categoriaActiva === indice" @click="irCategoria(indice)"><span></span></button>
          </div>
          <span>Deslizá para explorar →</span>
        </div>
      </section>

      <ProductosInicio />
      <PersonasInicio />
    </template>

    <section v-else class="inicio-cuenta">
      <p class="inicio-edicion">TU ESPACIO</p>
      <h1>Hola, {{ usuario.user_metadata?.nombre || 'qué bueno verte' }}.</h1>
      <p>{{ usuario.email }}</p>
      <button class="inicio-cuenta-publicar" type="button" @click="navegar('crear')">Preparar una publicación →</button>
      <button class="inicio-salir" type="button" :disabled="cerrando" @click="$emit('cerrar-sesion')">{{ cerrando ? 'Cerrando sesión…' : 'Cerrar sesión' }}</button>
      <p v-if="errorSesion" role="alert">{{ errorSesion }}</p>
    </section>

    <nav class="inicio-nav" aria-label="Navegación principal">
      <button type="button" :aria-current="seccion === 'inicio' ? 'page' : undefined" @click="navegar('inicio')"><span class="icono-inicio" aria-hidden="true"></span>Inicio</button>
      <button class="inicio-publicar" type="button" aria-label="Crear producto" @click="navegar('crear')"><span aria-hidden="true">+</span></button>
      <button type="button" :aria-current="seccion === 'cuenta' ? 'page' : undefined" @click="navegar('cuenta')"><span class="icono-usuario" aria-hidden="true"></span>Mi cuenta</button>
    </nav>
  </div>
</template>

<style scoped>
.inicio { position: relative; background: #f6f0e3; color: #211b17; min-height: 100svh; padding-bottom: 105px; }
.inicio-header { position: absolute; z-index: 2; top: 0; left: 0; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: max(18px, env(safe-area-inset-top)) 22px 10px; color: #fff0d8; }
.inicio-edicion { width: 100%; font: 9px 'Space Grotesk', sans-serif; letter-spacing: .08em; margin-bottom: 17px; }
.inicio-marca { font: 29px 'Busorama', sans-serif; letter-spacing: -.05em; }
.inicio-marca sup { font: 11px 'SF Regular', sans-serif; vertical-align: top; }

.categorias { position: relative; }
.categorias-carrusel { display: flex; overflow-x: auto; overflow-y: hidden; overscroll-behavior-x: contain; scroll-snap-type: x mandatory; scrollbar-width: none; }
.categorias-carrusel::-webkit-scrollbar { display: none; }
.categoria { position: relative; flex: 0 0 100%; min-width: 0; height: 100vh; height: 100svh; overflow: hidden; scroll-snap-align: start; background: #eaddc3; color: #fff0d8; }
.categoria > img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: center 62%; }
.categoria-texto { position: absolute; inset: 0; padding: max(134px, calc(env(safe-area-inset-top) + 116px)) 22px 105px; background: linear-gradient(to bottom, #00000038 0%, #00000055 33%, transparent 64%); }
.categoria-folio { display: flex; justify-content: space-between; font: 10px 'Space Grotesk', sans-serif; letter-spacing: .12em; }
/* Una misma grilla editorial para las seis categorías. */
.categoria h1 { display: grid; grid-template-rows: repeat(2, 1em); font: clamp(44px, 13.8vw, 62px)/1 'ITC Avant Medium', sans-serif; letter-spacing: -.055em; color: var(--categoria-acento); margin: 22px 0 20px; }
.categoria h1 span { display: block; white-space: nowrap; }
.categoria-detalles { display: flex; flex-wrap: wrap; align-content: start; gap: 8px 14px; min-height: 30px; max-width: 100%; padding: 0; margin: 0; list-style: none; font: 9px/1.4 'Space Grotesk', sans-serif; letter-spacing: .065em; }
.categoria-detalles li { display: flex; align-items: center; gap: 14px; white-space: nowrap; }
.categoria-detalles li + li::before { content: ''; flex: 0 0 2px; width: 2px; height: 2px; border-radius: 50%; background: currentColor; }
.categorias-controles { position: absolute; z-index: 2; top: max(66px, calc(env(safe-area-inset-top) + 48px)); left: 17px; right: 22px; color: #fff0d8; display: flex; justify-content: space-between; align-items: center; }
.categorias-controles > span { font: 10px 'SF Regular', sans-serif; }
.categorias-puntos { display: flex; }
.categorias-puntos button { color: inherit; padding: 0 5px; width: 25px; height: 44px; background: none; border: 0; }
.categorias-puntos span { display: block; width: 5px; height: 5px; background: currentColor; opacity: .5; border-radius: 50%; }
.categorias-puntos [aria-pressed="true"] span { background: currentColor; opacity: 1; width: 15px; border-radius: 3px; }
.inicio-nav { position: fixed; z-index: 20; bottom: max(14px, env(safe-area-inset-bottom)); left: 50%; transform: translateX(-50%); width: calc(100% - 36px); max-width: 436px; display: flex; justify-content: space-around; align-items: center; min-height: 65px; background: #fff8ee8c; backdrop-filter: blur(25px) saturate(1.3); -webkit-backdrop-filter: blur(25px) saturate(1.3); border: 1px solid #ffffff70; border-radius: 6px; box-shadow: 0 4px 22px #27180b22; }
.inicio-nav button { min-width: 76px; min-height: 48px; background: none; border: 0; font: 10px 'Space Grotesk', sans-serif; color: #211b17; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; }
.inicio-nav button > span { display: block; width: 24px; height: 24px; }
.inicio-nav button[aria-current] { color: #a13922; }
.inicio-nav .inicio-publicar { flex: 0 0 57px; width: 57px; min-width: 57px; height: 57px; padding: 0; margin: 0; border-radius: 50%; background: #a03923; color: white; justify-content: center; }
.inicio-nav .inicio-publicar > span { position: relative; display: block; width: 25px; height: 25px; font-size: 0; }
.inicio-publicar > span::before, .inicio-publicar > span::after { content: ''; position: absolute; background: currentColor; top: 50%; left: 50%; transform: translate(-50%, -50%); }
.inicio-publicar > span::before { width: 25px; height: 1.5px; }
.inicio-publicar > span::after { width: 1.5px; height: 25px; }
/* Ambos íconos usan el mismo cuadro de 24 × 24 px y el mismo trazo. */
.icono-inicio, .icono-usuario { position: relative; }
.icono-inicio::before { content: ''; position: absolute; width: 14px; height: 14px; border-top: 1.5px solid currentColor; border-left: 1.5px solid currentColor; transform: rotate(45deg); top: 4px; left: 5px; }
.icono-inicio::after { content: ''; position: absolute; width: 16px; height: 13px; border: 1.5px solid currentColor; border-top: 0; left: 4px; bottom: 1px; }
.icono-usuario::before { content: ''; position: absolute; width: 8px; height: 8px; border: 1.5px solid currentColor; border-radius: 50%; top: 2px; left: 50%; transform: translateX(-50%); }
.icono-usuario::after { content: ''; position: absolute; width: 17px; height: 11px; border: 1.5px solid currentColor; border-bottom: 0; border-radius: 11px 11px 0 0; bottom: 1px; left: 50%; transform: translateX(-50%); }
.inicio-cuenta { padding: 45px 22px; overflow-wrap: anywhere; }
.inicio-cuenta h1 { font: 30px/1.1 'ITC Avant Medium', sans-serif; letter-spacing: -.05em; }
.inicio-cuenta > p { font: 14px 'SF Regular', sans-serif; }
.inicio-cuenta button { display: block; min-height: 48px; padding: 12px 16px; border: 0; font: 14px 'SF Regular', sans-serif; margin-top: 24px; }
.inicio-cuenta-publicar { background: #bb592f; color: white; width: 100%; }
.inicio-salir { background: none; text-decoration: underline; }
@media (prefers-reduced-motion: reduce) { .categorias-carrusel { scroll-behavior: auto; } }
</style>
