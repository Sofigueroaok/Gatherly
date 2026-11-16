<script setup>
import magdalena from '../assets/personas.images/Magdalena.png'
import leonardo from '../assets/personas.images/Leonardo.png'
import alejandro from '../assets/personas.images/Alejandro.png'

// Perfiles de muestra para acompañar las fotos del diseño.
const personas = [
  {
    nombre: 'Magdalena',
    barrio: 'Palermo',
    foto: magdalena,
    posicion: '50% 35%',
    descripcion: 'Amo sacar fotos y pasar tiempo al aire libre. Con los años fui juntando equipo que no uso todos los fines de semana, así que prefiero compartirlo antes que dejarlo guardado.',
    objetos: 42,
    intereses: 'FOTOGRAFÍA · AIRE LIBRE'
  },
  {
    nombre: 'Leonardo',
    barrio: 'Buenos Aires',
    foto: leonardo,
    posicion: '65% 40%',
    descripcion: 'Me gusta armar planes con amigos y ponerle música a todo. Comparto equipos de sonido y objetos para hacer especial tu próximo encuentro.',
    objetos: 18,
    intereses: 'MÚSICA · ENCUENTROS'
  },
  {
    nombre: 'Alejandro',
    barrio: 'Buenos Aires',
    foto: alejandro,
    posicion: '50% 25%',
    descripcion: 'Soy mecánico, tengo gatos, compresores y cajas de herramientas. También ando con equipo de pesca y algún que otro fierro de carpintería. Si lo usás para arreglar, capaz yo lo tengo guardado.',
    objetos: 30,
    intereses: 'HERRAMIENTAS · PROYECTOS'
  }
]
</script>

<template>
  <section class="personas-inicio" aria-labelledby="personas-titulo">
    <header class="personas-encabezado">
      <h2 id="personas-titulo">Personas para descubrir</h2>
      <span aria-hidden="true">↗</span>
    </header>

    <div class="personas-lista">
      <article v-for="persona in personas" :key="persona.nombre" class="persona-tarjeta" :aria-label="`Conocé a ${persona.nombre}`">
        <img :src="persona.foto" :alt="`Retrato de ${persona.nombre}`" :style="{ objectPosition: persona.posicion }" loading="lazy" />
        <div class="persona-degradado" aria-hidden="true"></div>

        <div class="persona-contenido">
          <span class="persona-distincion">Miembro popular</span>
          <div class="persona-identidad">
            <h3>{{ persona.nombre }}</h3>
            <span>{{ persona.barrio }}</span>
          </div>
          <p class="persona-descripcion">{{ persona.descripcion }}</p>
          <p class="persona-objetos">{{ persona.objetos }} objetos disponibles · {{ persona.intereses }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.personas-inicio { background: #fffdf7; color: #211b17; }
.personas-encabezado { display: flex; align-items: center; justify-content: space-between; min-height: 64px; padding: 0 22px; }
.personas-encabezado h2 { margin: 0; font: 11px 'Space Grotesk', sans-serif; text-transform: uppercase; }
.personas-encabezado > span { font: 20px 'SF Regular', sans-serif; }
.personas-lista { display: grid; gap: 10px; }
/* Figma: ancho completo y 400 px de alto, sin relleno exterior. */
.persona-tarjeta { position: relative; width: 100%; height: 400px; overflow: hidden; background: #29271e; color: #fff8e9; }
.persona-tarjeta > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.persona-degradado { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 27%, #0c0b0a12 42%, #0c0b0ac4 72%, #0c0b0af5 100%); }
.persona-contenido { position: absolute; left: 22px; right: 22px; bottom: 23px; }
.persona-distincion { display: inline-block; margin-bottom: 10px; padding: 4px 6px; background: #fff8e92e; font: 9px 'Space Grotesk', sans-serif; text-transform: uppercase; letter-spacing: .03em; }
.persona-identidad { display: flex; align-items: baseline; flex-wrap: wrap; column-gap: 9px; row-gap: 4px; margin-bottom: 10px; }
.persona-identidad h3 { margin: 0; color: #f3b382; font: 27px/1.05 'ITC Avant Medium', sans-serif; letter-spacing: -.045em; }
.persona-identidad > span { font: 9px 'Space Grotesk', sans-serif; text-transform: uppercase; letter-spacing: .04em; }
.persona-descripcion { max-width: 350px; margin: 0 0 12px; font: 13px/1.3 'SF Regular', sans-serif; letter-spacing: -.01em; }
.persona-objetos { margin: 0; font: 9px/1.45 'Space Grotesk', sans-serif; text-transform: uppercase; letter-spacing: .025em; }
</style>
