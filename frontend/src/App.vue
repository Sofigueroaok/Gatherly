<script setup>
import {
  computed,
  ref,
  watch,
  onMounted,
  onBeforeUnmount
} from 'vue'

import imagenAcceso from './assets/images/acceso-vintage5.png'

// PANTALLAS
const pantalla = ref('portada')

const esRegistro = computed(() => pantalla.value === 'registro')
const panelAbierto = computed(() => pantalla.value !== 'portada')

// FORMULARIOS
const nombre = ref('')
const email = ref('')
const password = ref('')
const mostrarPassword = ref(false)
const mensaje = ref('')

// GESTO PARA CERRAR EL PANEL
let inicioGesto = 0

function cambiarPantalla(destino) {
  pantalla.value = destino
  password.value = ''
  mostrarPassword.value = false
  mensaje.value = ''
}

function cerrarPanel() {
  cambiarPantalla('portada')
}

function alPresionarTecla(evento) {
  if (evento.key === 'Escape' && panelAbierto.value) {
    cerrarPanel()
  }
}

function comenzarGesto(evento) {
  inicioGesto = evento.touches[0]?.clientY ?? 0
}

function terminarGesto(evento) {
  const finalGesto = evento.changedTouches[0]?.clientY ?? 0

  if (finalGesto - inicioGesto > 80) {
    cerrarPanel()
  }
}

// DEMOSTRACIÓN SIN AUTENTICACIÓN REAL
function enviarFormulario() {
  mensaje.value = esRegistro.value
    ? `¡Bienvenida, ${nombre.value}! Esta es una demostración; todavía no creamos cuentas reales.`
    : 'Formulario validado. Esta es una demostración; todavía no iniciamos una sesión real.'

  password.value = ''
  mostrarPassword.value = false
}

// EVITAR SCROLL DEL FONDO
watch(panelAbierto, (abierto) => {
  document.body.classList.toggle('panel-gatherly-abierto', abierto)
})

onMounted(() => {
  window.addEventListener('keydown', alPresionarTecla)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', alPresionarTecla)
  document.body.classList.remove('panel-gatherly-abierto')
})
</script>

<template>
  <main class="gatherly">

    <!-- PORTADA -->
    <section
      class="portada"
      :inert="panelAbierto"
      aria-label="Bienvenida a Gatherly"
    >
      <img
        class="portada-imagen"
        :src="imagenAcceso"
        alt="Una mujer con vestido amarillo de estética sesentosa."
        fetchpriority="high"
      />

      <div class="portada-vineta" aria-hidden="true"></div>

      <div class="portada-contenido">

        <!-- MARCA -->
        <header class="portada-cabecera">
          <p class="edicion">
            OTRA FORMA DE TENERLO TODO
          </p>

          <h1 class="marca">Gatherly</h1>
        </header>

        <!-- ACCESOS -->
        <div class="portada-acciones">
          <div class="acciones-fila">

            <button
              class="boton-glass boton-glass-principal"
              type="button"
              @click="cambiarPantalla('registro')"
            >
              CREAR CUENTA
            </button>

            <button
              class="boton-glass boton-glass-secundario"
              type="button"
              @click="cambiarPantalla('login')"
            >
              INGRESAR
            </button>

          </div>
        </div>

      </div>
    </section>

    <!-- FONDO OSCURECIDO -->
    <Transition name="velo">
      <button
        v-if="panelAbierto"
        class="velo-fondo"
        type="button"
        aria-label="Cerrar formulario"
        @click="cerrarPanel"
      ></button>
    </Transition>

    <!-- PANEL DESLIZABLE -->
    <Transition name="deslizar">
      <section
        v-if="panelAbierto"
        class="panel-acceso"
        :class="esRegistro ? 'panel-registro' : 'panel-login'"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="esRegistro ? 'titulo-registro' : 'titulo-login'"
      >

        <!-- TIRADOR -->
        <div
          class="panel-zona-gesto"
          aria-hidden="true"
          @touchstart.passive="comenzarGesto"
          @touchend.passive="terminarGesto"
        >
          <span class="panel-tirador"></span>
        </div>

        <!-- CABECERA -->
        <header class="panel-cabecera">
          <span class="panel-logo">Gatherly</span>

          <button
            class="panel-cerrar"
            type="button"
            aria-label="Cerrar"
            @click="cerrarPanel"
          >
            ×
          </button>
        </header>

        <!-- LOGIN / REGISTRO -->
        <Transition name="cambiar-formulario" mode="out-in">
          <div :key="pantalla" class="panel-cuerpo">

            <div class="panel-intro">
              <p class="panel-numero">
                {{
                  esRegistro
                    ? '01 / FORMÁ PARTE'
                    : '02 / BIENVENIDA DE NUEVO'
                }}
              </p>

              <h2
                :id="esRegistro ? 'titulo-registro' : 'titulo-login'"
                class="panel-titulo"
              >
                {{
                  esRegistro
                    ? 'Empecemos a compartir.'
                    : 'Qué bueno verte.'
                }}
              </h2>

              <p class="panel-subtitulo">
                {{
                  esRegistro
                    ? 'Creá tu cuenta y conectá con personas y objetos cerca tuyo.'
                    : 'Iniciá sesión para seguir compartiendo con tu comunidad.'
                }}
              </p>
            </div>

            <!-- FORMULARIO -->
            <form
              class="formulario"
              @submit.prevent="enviarFormulario"
              @input="mensaje = ''"
            >

              <div v-if="esRegistro" class="campo">
                <label for="nombre">
                  TU NOMBRE
                </label>

                <input
                  id="nombre"
                  v-model.trim="nombre"
                  name="nombre"
                  type="text"
                  placeholder="¿Cómo te llamás?"
                  autocomplete="given-name"
                  minlength="2"
                  required
                />
              </div>

              <div class="campo">
                <label for="email">
                  CORREO ELECTRÓNICO
                </label>

                <input
                  id="email"
                  v-model.trim="email"
                  name="email"
                  type="email"
                  placeholder="vos@ejemplo.com"
                  autocomplete="email"
                  autocapitalize="none"
                  :spellcheck="false"
                  required
                />
              </div>

              <div class="campo">
                <label for="password">
                  CONTRASEÑA
                </label>

                <div class="password-contenedor">
                  <input
                    id="password"
                    v-model="password"
                    name="password"
                    :type="mostrarPassword ? 'text' : 'password'"
                    :placeholder="
                      esRegistro
                        ? 'Mínimo 8 caracteres'
                        : 'Tu contraseña'
                    "
                    :autocomplete="
                      esRegistro
                        ? 'new-password'
                        : 'current-password'
                    "
                    :minlength="esRegistro ? 8 : undefined"
                    required
                  />

                  <button
                    class="ver-password"
                    type="button"
                    :aria-pressed="mostrarPassword"
                    aria-controls="password"
                    @click="mostrarPassword = !mostrarPassword"
                  >
                    {{ mostrarPassword ? 'OCULTAR' : 'VER' }}
                  </button>
                </div>
              </div>

              <button
                class="boton-enviar"
                type="submit"
              >
                {{
                  esRegistro
                    ? 'CREAR MI CUENTA'
                    : 'INICIAR SESIÓN'
                }}
              </button>

            </form>

            <p
              v-if="mensaje"
              class="mensaje"
              role="status"
            >
              {{ mensaje }}
            </p>

            <p class="panel-cambio">
              {{
                esRegistro
                  ? '¿Ya tenés cuenta?'
                  : '¿Todavía no tenés cuenta?'
              }}

              <button
                type="button"
                @click="
                  cambiarPantalla(
                    esRegistro ? 'login' : 'registro'
                  )
                "
              >
                {{
                  esRegistro
                    ? 'Iniciá sesión'
                    : 'Registrate'
                }}
              </button>
            </p>

          </div>
        </Transition>

      </section>
    </Transition>

  </main>
</template>