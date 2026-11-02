<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'

import { supabase } from './supabase.js'
import Inicio from './components/Inicio.vue'

import imagenAcceso from './assets/images/onboarding-camara.png'
import imagenHerramientas from './assets/images/onboarding-tool.png'
import imagenSuperblow from './assets/images/onboarding-superblow.png'

// PANTALLAS
const pantalla = ref('portada')

// Textos y fotos del onboarding. Cada elemento de las listas ocupa una línea.
const paginas = [
  {
    imagen: imagenAcceso, clase: '',
    alt: 'Una mujer con suéter amarillo sostiene una cámara de fotos.',
    introduccion: 'La nueva era del uso compartido.',
    titulo: ['Las cosas pasan.', 'Las historias quedan.'],
    descripcion: [
      'Todo lo que querés probar, usar y experimentar',
      'ya está disponible cerca tuyo. Alquilá sin complicaciones,',
      'optimizá tus gastos y hacé circular las cosas',
      'de manera más inteligente.'
    ]
  },
  {
    imagen: imagenHerramientas, clase: 'portada-herramientas',
    alt: 'Una mujer con sombrero lleva una caja amarilla de herramientas y un martillo.',
    titulo: ['Tenés un proyecto.', 'Encontrá con qué.'],
    descripcion: [
      'Elegí el objeto que te hace falta para tu proyecto.',
      'Consultá su disponibilidad, coordiná el alquiler',
      'con quien lo ofrece y acordá cómo retirarlo.',
      'Usalo el tiempo acordado y devolvelo al terminar.'
    ]
  },
  {
    imagen: imagenSuperblow, clase: 'portada-superblow',
    alt: 'Una mujer usa un secador de pelo Superblow amarillo de estilo setentoso.',
    titulo: ['Eso que no usás', 'también tiene planes.'],
    descripcion: [
      'Poné en alquiler eso que no usás todos los días.',
      'Conectá con personas que lo necesitan y dale',
      'más uso a tus objetos. Creá tu cuenta para empezar',
      'o ingresá si ya sos parte de la comunidad.'
    ]
  }
]
const paginaOnboarding = ref(1)
const paginaActual = computed(() => paginas[paginaOnboarding.value - 1])
const esRegistro = computed(() => pantalla.value === 'registro')

function siguienteOnboarding() {
  if (paginaOnboarding.value < paginas.length) paginaOnboarding.value++
}

// FORMULARIOS
const nombre = ref('')
const email = ref('')
const password = ref('')
const mostrarPassword = ref(false)
const confirmarPassword = ref('')
const mostrarConfirmacion = ref(false)
const campoConfirmacion = ref(null)
const recuperandoPassword = ref(false)
const mensaje = ref('')
const enviando = ref(false)
const sesion = ref(null)
const panelAbierto = computed(() => !sesion.value && pantalla.value !== 'portada')
let suscripcionAuth = null
let envioActual = 0

const textosAcceso = {
  registro: {
    numero: '01 / FORMÁ PARTE', titulo: 'Empecemos a compartir.',
    subtitulo: 'Creá tu cuenta y conectá con tu comunidad.',
    boton: 'CREAR MI CUENTA', espera: 'CREANDO CUENTA…'
  },
  login: {
    numero: '02 / BIENVENIDA DE NUEVO', titulo: 'Nos agrada tu visita.',
    subtitulo: 'Iniciá sesión para seguir compartiendo con tu comunidad.',
    boton: 'INICIAR SESIÓN', espera: 'INICIANDO SESIÓN…'
  },
  recuperar: {
    numero: 'RECUPERAR ACCESO', titulo: 'Recuperá tu contraseña.',
    subtitulo: 'Ingresá el correo que usaste para crear tu cuenta.',
    boton: 'ENVIAR ENLACE', espera: 'ENVIANDO…'
  }
}
const textosPanel = computed(() => textosAcceso[recuperandoPassword.value ? 'recuperar' : pantalla.value])

// GESTO PARA CERRAR EL PANEL
let inicioGesto = 0

function cambiarPantalla(destino) {
  envioActual++
  enviando.value = false
  pantalla.value = destino
  recuperandoPassword.value = false
  password.value = ''
  confirmarPassword.value = ''
  mostrarConfirmacion.value = false
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

// REGISTRO E INICIO DE SESIÓN EN SUPABASE AUTH
async function enviarFormulario() {
  if (enviando.value) return

  if (recuperandoPassword.value) {
    mensaje.value = 'La recuperación estará disponible pronto. Todavía no enviamos correos.'
    return
  }

  if (esRegistro.value && password.value !== confirmarPassword.value) {
    mensaje.value = 'Las contraseñas no coinciden. Revisalas antes de continuar.'
    return
  }

  if (!supabase) {
    mensaje.value = 'Falta configurar la conexión con Supabase. Revisá el archivo .env.local y reiniciá el servidor.'
    return
  }

  const numeroEnvio = ++envioActual
  const esAlta = esRegistro.value
  enviando.value = true
  mensaje.value = ''

  try {
    const credenciales = { email: email.value.trim(), password: password.value }
    const { data, error } = esAlta
      ? await supabase.auth.signUp({
          ...credenciales,
          options: {
            data: { nombre: nombre.value.trim() },
            emailRedirectTo: window.location.origin
          }
        })
      : await supabase.auth.signInWithPassword(credenciales)

    // Si se cerró o cambió de formulario, no mostrar una respuesta atrasada.
    if (numeroEnvio !== envioActual) return
    if (error) throw error
    if (!data.user) throw new Error('No se recibió la cuenta.')

    if (!esAlta) {
      if (!data.session) throw new Error('No se recibió la sesión.')
      sesion.value = data.session
      mensaje.value = ''
    } else if (data.user.identities?.length === 0) {
      mensaje.value = 'Si ya tenés una cuenta con ese correo, usá Iniciar sesión. Si todavía no la confirmaste, revisá tu bandeja de entrada.'
    } else {
      mensaje.value = data.session
        ? 'Tu cuenta ya está creada y la sesión está iniciada.'
        : '¡Listo! Revisá tu correo y confirmá el registro con el enlace que te enviamos. Mirá también la carpeta de spam.'
    }

    password.value = ''
    confirmarPassword.value = ''
    mostrarPassword.value = false
    mostrarConfirmacion.value = false
  } catch (error) {
    if (numeroEnvio !== envioActual) return

    const errores = {
      invalid_credentials: 'El correo o la contraseña no son correctos. Revisalos y volvé a intentar.',
      email_not_confirmed: 'Primero confirmá tu correo con el enlace que recibiste. Después volvé a iniciar sesión.',
      user_banned: 'No se puede iniciar sesión con esta cuenta. Consultá con quien administra Gatherly.',
      email_address_invalid: 'Revisá que el correo esté bien escrito.',
      email_address_not_authorized: 'Este proyecto todavía no puede enviar confirmaciones a ese correo. Hay que revisar el servicio de correo de Supabase.',
      user_already_exists: 'Si ya tenés una cuenta con ese correo, usá Iniciar sesión.',
      weak_password: 'Elegí una contraseña más segura, de al menos 8 caracteres.',
      over_email_send_rate_limit: 'Se alcanzó el límite de correos. Esperá unos minutos antes de volver a intentar.',
      over_request_rate_limit: 'Hubo demasiados intentos. Esperá un momento y volvé a probar.',
      signup_disabled: 'El registro está desactivado en Supabase.',
      email_provider_disabled: 'El registro con correo está desactivado en Supabase.',
      captcha_failed: 'No se pudo verificar el registro. Hay que revisar la configuración de CAPTCHA.',
      unexpected_failure: 'No se pudo completar la operación. Hay que revisar los registros de Auth en Supabase.'
    }

    mensaje.value = errores[error.code] || (
      error.name === 'AuthRetryableFetchError' || error instanceof TypeError
        ? 'No pudimos conectar. Revisá tu conexión a internet y volvé a intentar.'
        : 'No se pudo completar la operación. Volvé a intentar; si continúa, revisamos la configuración de Supabase.'
    )
  } finally {
    if (numeroEnvio === envioActual) enviando.value = false
  }
}

// Cerrar solo la sesión de este navegador.
async function cerrarSesion() {
  if (enviando.value || !supabase) return
  const numeroEnvio = ++envioActual
  enviando.value = true
  mensaje.value = ''
  try {
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    if (numeroEnvio !== envioActual) return
    if (error) throw error
    sesion.value = null
    password.value = ''
    mensaje.value = 'Cerraste sesión.'
  } catch {
    if (numeroEnvio === envioActual) mensaje.value = 'No se pudo cerrar la sesión. Volvé a intentar.'
  } finally {
    if (numeroEnvio === envioActual) enviando.value = false
  }
}

// La confirmación se valida en el navegador y no se envía al backend.
watch([password, confirmarPassword, campoConfirmacion], () => {
  campoConfirmacion.value?.setCustomValidity(
    confirmarPassword.value && password.value !== confirmarPassword.value
      ? 'Las contraseñas no coinciden.'
      : ''
  )
})

// EVITAR SCROLL DEL FONDO
watch(panelAbierto, (abierto) => {
  document.body.classList.toggle('panel-gatherly-abierto', abierto)
})

onMounted(() => {
  if (supabase) {
    const { data } = supabase.auth.onAuthStateChange((_evento, sesionActual) => {
      sesion.value = sesionActual
    })
    suscripcionAuth = data.subscription
  }
  window.addEventListener('keydown', alPresionarTecla)
})

onBeforeUnmount(() => {
  suscripcionAuth?.unsubscribe()
  window.removeEventListener('keydown', alPresionarTecla)
  document.body.classList.remove('panel-gatherly-abierto')
})
</script>

<template>
  <main class="gatherly">

    <Inicio v-if="sesion" :usuario="sesion.user" :cerrando="enviando" :error-sesion="mensaje" @cerrar-sesion="cerrarSesion" />

    <!-- PORTADA -->
    <section v-else
      class="portada"
      :class="paginaActual.clase"
      :inert="panelAbierto"
      aria-label="Bienvenida a Gatherly"
    >
      <img
        class="portada-imagen"
        :src="paginaActual.imagen"
        :alt="paginaActual.alt"
        fetchpriority="high"
      />

      <div class="portada-vineta" aria-hidden="true"></div>

      <div class="portada-contenido">

        <nav class="portada-folio" aria-label="Presentación">
          <span aria-live="polite">Pág. {{ paginaOnboarding }} de {{ paginas.length }}</span>
          <button v-if="paginaOnboarding === paginas.length" type="button" @click="paginaOnboarding = 2">← Anterior</button>
          <button v-else type="button" @click="cambiarPantalla('login')">Omitir</button>
        </nav>

        <header class="portada-cabecera">
          <p v-if="paginaActual.introduccion" class="portada-introduccion">{{ paginaActual.introduccion }}</p>
          <h1 class="portada-titulo">
            <template v-for="(linea, indice) in paginaActual.titulo" :key="linea">{{ linea }}<br v-if="indice < paginaActual.titulo.length - 1" /></template>
          </h1>
          <p class="portada-descripcion">
            <template v-for="(linea, indice) in paginaActual.descripcion" :key="linea">{{ linea }}<br v-if="indice < paginaActual.descripcion.length - 1" /></template>
          </p>
          <span v-if="paginaOnboarding === 1" class="marca">Gatherly<sup class="marca-copyright" aria-label="Copyright">©</sup></span>
        </header>

        <!-- NAVEGACIÓN Y ACCESOS FINALES -->
        <div class="portada-acciones" :class="{ 'portada-acciones-doble': paginaOnboarding >= 2 }">
          <template v-if="paginaOnboarding < paginas.length">
            <button
              v-if="paginaOnboarding === 2"
              class="boton-anterior"
              type="button"
              @click="paginaOnboarding = 1"
            >
              <span aria-hidden="true">←</span> Anterior
            </button>
            <button class="boton-siguiente" type="button" @click="siguienteOnboarding">
              Siguiente <span aria-hidden="true">→</span>
            </button>
          </template>

          <template v-else>
            <button class="boton-anterior" type="button" @click="cambiarPantalla('login')">
              Iniciar sesión
            </button>
            <button class="boton-siguiente" type="button" @click="cambiarPantalla('registro')">
              Crear cuenta
            </button>
          </template>
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
              <p class="panel-numero">{{ textosPanel.numero }}</p>
              <h2 :id="esRegistro ? 'titulo-registro' : 'titulo-login'" class="panel-titulo">{{ textosPanel.titulo }}</h2>
              <p class="panel-subtitulo">{{ textosPanel.subtitulo }}</p>
            </div>

            <!-- Solo los campos y las opciones se desplazan. -->
            <div class="panel-desplazable">
              <button v-if="recuperandoPassword" class="otros-metodos" type="button" @click="recuperandoPassword = false; mensaje = ''">
                ← Volver a iniciar sesión
              </button>

              <form
                class="formulario"
                @submit.prevent="enviarFormulario"
                @input="mensaje = ''"
              >

                <div v-if="esRegistro" class="campo">
                  <label for="nombre">TU NOMBRE</label>

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
                  <label for="email">CORREO ELECTRÓNICO</label>

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

                <div v-if="!recuperandoPassword" class="campo">
                  <label for="password">CONTRASEÑA</label>

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

                <div v-if="esRegistro" class="campo">
                  <label for="confirmar-password">CONFIRMÁ TU CONTRASEÑA</label>
                  <div class="password-contenedor">
                    <input
                      id="confirmar-password"
                      ref="campoConfirmacion"
                      v-model="confirmarPassword"
                      name="confirmar-password"
                      :type="mostrarConfirmacion ? 'text' : 'password'"
                      placeholder="Repetí tu contraseña"
                      autocomplete="new-password"
                      minlength="8"
                      required
                    />
                    <button
                      class="ver-password"
                      type="button"
                      :aria-pressed="mostrarConfirmacion"
                      aria-controls="confirmar-password"
                      @click="mostrarConfirmacion = !mostrarConfirmacion"
                    >
                      {{ mostrarConfirmacion ? 'OCULTAR' : 'VER' }}
                    </button>
                  </div>
                </div>

                <button
                  v-if="!esRegistro && !recuperandoPassword"
                  class="olvidaste-password"
                  type="button"
                  @click="recuperandoPassword = true; password = ''; mostrarPassword = false; mensaje = ''"
                >
                  ¿Olvidaste tu contraseña?
                </button>

                <button
                  class="boton-enviar"
                  type="submit"
                  :disabled="enviando"
                  :aria-busy="enviando"
                >
                  {{ enviando ? textosPanel.espera : textosPanel.boton }}
                </button>

              </form>

              <p
                v-if="mensaje"
                class="mensaje"
                role="status"
              >
                {{ mensaje }}
              </p>

              <div v-if="!recuperandoPassword" class="acceso-secundario">
                <p class="acceso-alternativo">O continuá con</p>
                <div class="metodos-acceso" aria-label="Otras formas de acceso">
                <button class="boton-metodo" type="button" aria-label="Continuar con Apple (próximamente)" disabled>
                  <img src="./assets/images/apple.svg" alt="" />
                  <span>Apple</span>
                </button>
                <button class="boton-metodo" type="button" aria-label="Continuar con Google (próximamente)" disabled>
                  <img src="./assets/images/google.svg" alt="" />
                  <span>Google</span>
                </button>
                </div>
                <p class="proveedores-pendientes">Apple y Google · Próximamente</p>
              </div>

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

          </div>
        </Transition>

      </section>
    </Transition>

  </main>
</template>