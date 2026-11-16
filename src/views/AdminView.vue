<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase.js'

const router = useRouter()

const usuarioActual = ref(null)
const rolActual = ref(null)
const cargando = ref(true)
const errorMsg = ref('')
const usuarios = ref([])
const productos = ref([])
const categorias = ref([])
const categoriasAbiertas = ref(false)
const alquileres = ref([])
const pagos = ref([])
const estados = ref([])
const roles = ref([])

const busquedaUsuario = ref('')
const busquedaProducto = ref('')
const busquedaCategoria = ref('')

//crud categorias

const formCategoriaAbierto = ref(false)
const guardandoCategoria = ref(false)
const errorCategoria = ref('')
const categoriaEditandoId = ref(null)
const formCategoria = ref({ nombre: '', descripcion: '' })

const abrirNuevaCategoria = () => {
  categoriasAbiertas.value = true
  categoriaEditandoId.value = null
  formCategoria.value = { nombre: '', descripcion: '' }
  errorCategoria.value = ''
  formCategoriaAbierto.value = true
}

const abrirEditarCategoria = (categoria) => {
  categoriasAbiertas.value = true
  categoriaEditandoId.value = categoria.id_categoria
  formCategoria.value = {
    nombre: categoria.nombre || '',
    descripcion: categoria.descripcion || ''
  }
  errorCategoria.value = ''
  formCategoriaAbierto.value = true
}

const cancelarFormCategoria = () => {
  formCategoriaAbierto.value = false
  categoriaEditandoId.value = null
  formCategoria.value = { nombre: '', descripcion: '' }
  errorCategoria.value = ''
}

const guardarCategoria = async () => {
  const nombre = formCategoria.value.nombre.trim()
  const descripcion = formCategoria.value.descripcion.trim()

  if (!nombre) {
    errorCategoria.value = 'El nombre de la categoría es obligatorio.'
    return
  }

  guardandoCategoria.value = true
  errorCategoria.value = ''

  try {
    if (categoriaEditandoId.value) {
      const { data, error } = await supabase
        .from('categoria')
        .update({ nombre, descripcion: descripcion || null })
        .eq('id_categoria', categoriaEditandoId.value)
        .select()
        .single()

      if (error) throw error

      const index = categorias.value.findIndex(
        c => c.id_categoria === categoriaEditandoId.value
      )
      if (index !== -1) categorias.value[index] = data
    } else {
      const { data, error } = await supabase
        .from('categoria')
        .insert({ nombre, descripcion: descripcion || null })
        .select()
        .single()

      if (error) throw error
      categorias.value.push(data)
    }

    cancelarFormCategoria()
  } catch (error) {
    errorCategoria.value = error.message || 'No se pudo guardar la categoría.'
  } finally {
    guardandoCategoria.value = false
  }
}

const eliminarCategoria = async (categoria) => {
  const tieneProductos = productos.value.some(
    p => p.id_categoria === categoria.id_categoria
  )

  if (tieneProductos) {
    errorCategoria.value = `No podés eliminar "${categoria.nombre}" porque tiene productos asociados.`
    return
  }

  if (!window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return

  errorCategoria.value = ''

  try {
    const { error } = await supabase
      .from('categoria')
      .delete()
      .eq('id_categoria', categoria.id_categoria)

    if (error) throw error

    categorias.value = categorias.value.filter(
      c => c.id_categoria !== categoria.id_categoria
    )

    if (categoriaEditandoId.value === categoria.id_categoria) {
      cancelarFormCategoria()
    }
  } catch (error) {
    errorCategoria.value = error.message || 'No se pudo eliminar la categoría.'
  }
}

//formatear precio y fecha

const formatearPrecio = valor => Number(valor || 0).toLocaleString('es-AR')
const formatearFecha = fecha => fecha ? new Date(fecha).toLocaleDateString('es-AR') : '-'

const ingresosTotales = computed(() =>
  pagos.value.reduce((total, pago) => total + Number(pago.monto || 0), 0)
)

const estadisticas = computed(() => [
  { etiqueta: 'USUARIOS', valor: usuarios.value.length },
  { etiqueta: 'PRODUCTOS', valor: productos.value.length },
  { etiqueta: 'ALQUILERES', valor: alquileres.value.length },
  { etiqueta: 'CATEGORÍAS', valor: categorias.value.length },
  { etiqueta: 'INGRESOS', valor: `$${formatearPrecio(ingresosTotales.value)}`, grande: true }
])

const resumenEstados = computed(() => [
  { etiqueta: 'Disponibles', clase: 'punto-disponible', total: estados.value.filter(e => e.disponible).length },
  { etiqueta: 'Alquilados', clase: 'punto-alquilado', total: estados.value.filter(e => e.alquilado).length },
  { etiqueta: 'Frenados', clase: 'punto-frenado', total: estados.value.filter(e => e.frenado).length }
])

const filtrarLista = (lista, consulta, campos) => {
  const termino = consulta.trim().toLocaleLowerCase('es-AR')
  if (!termino) return lista

  return lista.filter(item =>
    campos.some(campo => String(item[campo] ?? '').toLocaleLowerCase('es-AR').includes(termino))
  )
}

const usuariosFiltrados = computed(() =>
  filtrarLista(usuarios.value, busquedaUsuario.value, ['nombre', 'apellido', 'email'])
)

const productosFiltrados = computed(() =>
  filtrarLista(productos.value, busquedaProducto.value, ['nombre', 'descripcion', 'ubicacion'])
)

const categoriasFiltradas = computed(() =>
  filtrarLista(categorias.value, busquedaCategoria.value, ['nombre', 'descripcion'])
)

const obtenerNombreRol = id =>
  roles.value.find(rol => rol.id_rol === id)?.nombre || 'Sin rol'

const obtenerNombreCategoria = id =>
  categorias.value.find(categoria => categoria.id_categoria === id)?.nombre || 'Sin categoría'

const nombreUsuario = id => {
  const usuario = usuarios.value.find(item => item.id_usuario === id)
  return usuario ? `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() : 'Usuario desconocido'
}

const infoEstado = id => {
  const estado = estados.value.find(item => item.id_estado === id)
  if (!estado) return { texto: 'Sin estado', clase: 'estado-neutro' }
  if (estado.alquilado) return { texto: 'Alquilado', clase: 'estado-alquilado' }
  if (estado.frenado) return { texto: 'Frenado', clase: 'estado-frenado' }
  if (estado.disponible) return { texto: 'Disponible', clase: 'estado-disponible' }
  return { texto: 'Sin estado', clase: 'estado-neutro' }
}

const comprobarAdministrador = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error

  if (!user) {
    router.replace({ name: 'login' })
    return false
  }

  usuarioActual.value = user

  const { data: usuario, error: errorUsuario } = await supabase
    .from('usuario')
    .select('id_usuario, nombre, apellido, email, id_rol')
    .eq('email', user.email)
    .single()

  if (errorUsuario) throw new Error(`No se encontró el usuario: ${errorUsuario.message}`)

  const { data: rol, error: errorRol } = await supabase
    .from('rol')
    .select('id_rol, nombre, descripcion')
    .eq('id_rol', usuario.id_rol)
    .single()

  if (errorRol) throw new Error(`No se pudo comprobar el rol: ${errorRol.message}`)

  rolActual.value = rol

  if (!['admin', 'administrador'].includes((rol.nombre || '').toLowerCase())) {
    router.replace({ name: 'inicio' })
    return false
  }

  return true
}

const cargarDashboard = async () => {
  cargando.value = true
  errorMsg.value = ''

  try {
    if (!(await comprobarAdministrador())) return

    const consultas = await Promise.all([
      supabase.from('usuario').select('*').order('id_usuario', { ascending: false }),
      supabase.from('producto').select('*').order('id_producto', { ascending: false }),
      supabase.from('categoria').select('*').order('id_categoria'),
      supabase.from('alquiler').select('*').order('id_alquiler', { ascending: false }),
      supabase.from('pago').select('*').order('id_pago', { ascending: false }),
      supabase.from('estado').select('*').order('id_estado'),
      supabase.from('rol').select('*').order('id_rol')
    ])

    const resultadoConError = consultas.find(({ error }) => error)
    if (resultadoConError) throw resultadoConError.error

    ;[
      usuarios.value,
      productos.value,
      categorias.value,
      alquileres.value,
      pagos.value,
      estados.value,
      roles.value
    ] = consultas.map(({ data }) => data || [])
  } catch (error) {
    errorMsg.value = error.message || 'Ocurrió un error inesperado.'
  } finally {
    cargando.value = false
  }
}

const cerrarSesion = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    errorMsg.value = error.message
    return
  }
  router.replace({ name: 'login' })
}

onMounted(cargarDashboard)
</script>

<template>
  <main class="gatherly admin-vista">
    <div class="admin-contenido">
      <header class="portada-folio admin-folio">
        <button type="button" @click="router.push({ name: 'inicio' })">← Inicio</button>
        <span>GATHERLY / ADMIN</span>
        <button type="button" @click="cerrarSesion">Cerrar sesión</button>
      </header>

      <section class="admin-intro">
        <p class="portada-introduccion">PANEL DE ADMINISTRACIÓN</p>
        <h1 class="portada-titulo">Gestioná Gatherly.</h1>
        <p class="portada-descripcion">
          Controlá usuarios, publicaciones, categorías, alquileres y pagos desde un solo lugar.
        </p>
      </section>

      <p v-if="cargando" class="mensaje" role="status">Cargando información del panel…</p>

      <section v-else-if="errorMsg" class="mensaje admin-error" role="alert">
        <strong>No se pudo cargar el dashboard.</strong>
        <p>{{ errorMsg }}</p>
        <button class="boton-enviar" type="button" @click="cargarDashboard">
          INTENTAR NUEVAMENTE
        </button>
      </section>

      <template v-else>
        <section class="admin-saludo" aria-label="Sesión actual">
          <p class="portada-introduccion">SESIÓN ACTUAL</p>
          <h2>Hola, {{ usuarioActual?.user_metadata?.nombre || 'administrador' }}.</h2>
          <p>Rol: <strong>{{ rolActual?.nombre || 'Administrador' }}</strong></p>
        </section>

        <section class="estadisticas" aria-label="Resumen general">
          <article
            v-for="stat in estadisticas"
            :key="stat.etiqueta"
            class="estadistica"
            :class="{ 'estadistica-grande': stat.grande }"
          >
            <span>{{ stat.etiqueta }}</span>
            <strong>{{ stat.valor }}</strong>
          </article>
        </section>

        <section class="panel-seccion">
          <header class="seccion-cabecera">
            <div>
              <p class="portada-introduccion">ACTIVIDAD</p>
              <h2>Estado de alquileres</h2>
            </div>
          </header>
          <div class="estado-resumen">
            <article v-for="item in resumenEstados" :key="item.etiqueta" class="estadistica-fila">
              <span class="punto" :class="item.clase" aria-hidden="true"></span>
              <div>
                <small>{{ item.etiqueta }}</small>
                <strong>{{ item.total }}</strong>
              </div>
            </article>
          </div>
        </section>

        <section class="panel-seccion">
          <header class="seccion-cabecera">
            <div>
              <p class="portada-introduccion">BASE DE DATOS</p>
              <h2>Usuarios</h2>
            </div>
            <strong>{{ usuarios.length }}</strong>
          </header>
          <div class="campo admin-buscador">
            <input v-model="busquedaUsuario" type="search" aria-label="Buscar usuarios" placeholder="Buscar por nombre o email…" />
          </div>
          <p v-if="!usuariosFiltrados.length" class="vacio">No se encontraron usuarios.</p>
          <div v-else class="tabla-contenedor">
            <table>
              <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th></tr></thead>
              <tbody>
                <tr v-for="usuario in usuariosFiltrados" :key="usuario.id_usuario">
                  <td><strong>{{ usuario.nombre || '-' }} {{ usuario.apellido || '' }}</strong></td>
                  <td>{{ usuario.email || '-' }}</td>
                  <td><span class="etiqueta-borde">{{ obtenerNombreRol(usuario.id_rol) }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="panel-seccion">
          <header class="seccion-cabecera">
            <div>
              <p class="portada-introduccion">PUBLICACIONES</p>
              <h2>Productos</h2>
            </div>
            <strong>{{ productos.length }}</strong>
          </header>
          <div class="campo admin-buscador">
            <input v-model="busquedaProducto" type="search" aria-label="Buscar productos" placeholder="Buscar producto, descripción o ubicación…" />
          </div>
          <p v-if="!productosFiltrados.length" class="vacio">No se encontraron productos.</p>
          <div v-else class="productos-lista">
            <article v-for="producto in productosFiltrados" :key="producto.id_producto" class="producto-card">
              <img v-if="producto.foto" :src="producto.foto" :alt="producto.nombre || 'Foto del producto'" loading="lazy" />
              <div v-else class="producto-sin-foto">Sin foto</div>
              <div class="producto-info">
                <p class="portada-introduccion">{{ obtenerNombreCategoria(producto.id_categoria) }}</p>
                <h3>{{ producto.nombre || 'Producto sin nombre' }}</h3>
                <p class="producto-descripcion">{{ producto.descripcion || 'Sin descripción.' }}</p>
                <div class="producto-datos">
                  <strong>${{ formatearPrecio(producto.precio) }} <small>/ día</small></strong>
                  <span>{{ producto.ubicacion || 'Sin ubicación' }}</span>
                </div>
                <small>Publicado por: {{ nombreUsuario(producto.id_usuario) }}</small>
              </div>
            </article>
          </div>
        </section>

        <!-- CATEGORÍAS CON CRUD -->
        <section class="panel-seccion">
          <header class="seccion-cabecera">
            <div>
              <p class="portada-introduccion">CLASIFICACIÓN</p>
              <h2>Categorías</h2>
            </div>

            <div class="admin-categorias-controles">
              <button
                type="button"
                class="admin-btn-agregar"
                @click="abrirNuevaCategoria"
              >
                + Agregar
              </button>

              <button
                type="button"
                class="admin-categorias-toggle"
                @click="categoriasAbiertas = !categoriasAbiertas"
                :aria-expanded="categoriasAbiertas"
                aria-controls="categorias-contenido"
              >
                <strong>{{ categorias.length }}</strong>
                <span>{{ categoriasAbiertas ? 'Ocultar' : 'Ver' }}</span>
                <span
                  class="admin-categorias-flecha"
                  :class="{ 'is-open': categoriasAbiertas }"
                  aria-hidden="true"
                >⌄</span>
              </button>
            </div>
          </header>

          <Transition name="categorias-desplegable">
            <div v-show="categoriasAbiertas" id="categorias-contenido">
              <!-- FORMULARIO AGREGAR / EDITAR -->
              <form
                v-if="formCategoriaAbierto"
                class="formulario admin-form-categoria"
                @submit.prevent="guardarCategoria"
              >
                <p class="portada-introduccion">
                  {{ categoriaEditandoId ? `EDITANDO CATEGORÍA #${categoriaEditandoId}` : 'NUEVA CATEGORÍA' }}
                </p>

                <div class="campo">
                  <label for="cat-nombre">NOMBRE</label>
                  <input
                    id="cat-nombre"
                    v-model="formCategoria.nombre"
                    type="text"
                    placeholder="Ej. Herramientas eléctricas"
                    required
                  />
                </div>

                <div class="campo">
                  <label for="cat-descripcion">DESCRIPCIÓN</label>
                  <input
                    id="cat-descripcion"
                    v-model="formCategoria.descripcion"
                    type="text"
                    placeholder="Breve descripción de la categoría…"
                  />
                </div>

                <div class="admin-form-acciones">
                  <button
                    type="submit"
                    class="boton-enviar"
                    :disabled="guardandoCategoria"
                  >
                    {{ guardandoCategoria ? 'GUARDANDO…' : (categoriaEditandoId ? 'GUARDAR CAMBIOS' : 'CREAR CATEGORÍA') }}
                  </button>
                  <button
                    type="button"
                    class="boton-anterior"
                    :disabled="guardandoCategoria"
                    @click="cancelarFormCategoria"
                  >
                    Cancelar
                  </button>
                </div>
              </form>

              <p v-if="errorCategoria" class="mensaje admin-categoria-error" role="alert">
                {{ errorCategoria }}
              </p>

              <div class="campo admin-buscador">
                <input
                  v-model="busquedaCategoria"
                  type="search"
                  aria-label="Buscar categorías"
                  placeholder="Buscar categoría..."
                />
              </div>

              <p v-if="!categoriasFiltradas.length" class="vacio">
                {{
                  categorias.length
                    ? 'No se encontraron categorías.'
                    : 'Todavía no hay categorías registradas.'
                }}
              </p>

              <div v-else class="tabla-contenedor">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr
                      v-for="categoria in categoriasFiltradas"
                      :key="categoria.id_categoria"
                    >
                      <td>{{ categoria.id_categoria }}</td>
                      <td>
                        <strong>{{ categoria.nombre || 'Sin nombre' }}</strong>
                      </td>
                      <td>{{ categoria.descripcion || 'Sin descripción' }}</td>
                      <td>
                        <div class="admin-tabla-acciones">
                          <button
                            type="button"
                            class="etiqueta-borde admin-btn-accion"
                            @click="abrirEditarCategoria(categoria)"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            class="etiqueta-borde admin-btn-accion admin-btn-eliminar"
                            @click="eliminarCategoria(categoria)"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Transition>
        </section>

        <section class="panel-seccion">
          <header class="seccion-cabecera">
            <div><p class="portada-introduccion">OPERACIONES</p><h2>Alquileres</h2></div>
            <strong>{{ alquileres.length }}</strong>
          </header>
          <p v-if="!alquileres.length" class="vacio">No hay alquileres registrados.</p>
          <div v-else class="tabla-contenedor">
            <table>
              <thead><tr><th>Usuario</th><th>Inicio</th><th>Final</th><th>Estado</th><th>Pago</th></tr></thead>
              <tbody>
                <tr v-for="alquiler in alquileres" :key="alquiler.id_alquiler">
                  <td>{{ nombreUsuario(alquiler.id_usuario) }}</td>
                  <td>{{ formatearFecha(alquiler.fecha_inicio) }}</td>
                  <td>{{ formatearFecha(alquiler.fecha_final) }}</td>
                  <td><span class="estado-tag" :class="infoEstado(alquiler.id_estado).clase">{{ infoEstado(alquiler.id_estado).texto }}</span></td>
                  <td>{{ alquiler.id_pago ? `#${alquiler.id_pago}` : 'Sin pago' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="panel-seccion">
          <header class="seccion-cabecera">
            <div><p class="portada-introduccion">FINANZAS</p><h2>Pagos</h2></div>
            <strong>{{ pagos.length }}</strong>
          </header>
          <p v-if="!pagos.length" class="vacio">No hay pagos registrados.</p>
          <div v-else class="tabla-contenedor">
            <table>
              <thead><tr><th>Alquiler</th><th>Metodo</th><th>Monto</th><th>Estado</th><th>Fecha</th></tr></thead>
              <tbody>
                <tr v-for="pago in pagos" :key="pago.id_pago">
                  <td>#{{ pago.id_alquiler }}</td>
                  <td>{{ pago.metodo || '-' }}</td>
                  <td><strong>${{ formatearPrecio(pago.monto) }}</strong></td>
                  <td>{{ pago.estado_pago || '-' }}</td>
                  <td>{{ formatearFecha(pago.fecha_pago) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </div>
  </main>
</template>

<style scoped>
.admin-vista {
  width: 100%;
  max-width: 1100px;
  min-height: 100svh;
  overflow: visible;
}

.admin-contenido {width: min(100%, 1000px);margin-inline: auto;padding: 22px clamp(16px, 4vw, 32px) 60px;}
.admin-folio { margin-bottom: 35px; }
.admin-folio button:first-child { padding-left: 0; text-decoration: none; }
.admin-intro { margin-bottom: 32px; }
.admin-intro .portada-titulo { max-width: 700px; }
.admin-intro .portada-descripcion { max-width: 480px; letter-spacing: -0.02em; }
.admin-error p { margin: 6px 0 14px; }

.admin-saludo,
.estadistica,
.estadistica-fila,
.tabla-contenedor {
  border: 1px solid var(--linea);
  background: rgba(248, 241, 223, 0.85);
}

.admin-saludo {
  margin-bottom: 24px;
  padding: 20px;
  background: #e9decb;
}

.admin-saludo h2,
.seccion-cabecera h2 {
  margin: 2px 0 6px;
  font-family: "ITC Avant Medium", sans-serif;
  font-size: clamp(19px, 3vw, 22px);
}

.admin-saludo p:last-child {
  margin: 0;
  font-family: "SF Regular", sans-serif;
  font-size: 13px;
}

.estadisticas {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 35px;
}

.estadistica { min-width: 0; padding: 15px; }
.estadistica span,
.estadistica-fila small,
th { font-size: 10px; letter-spacing: 0.06em; }
.estadistica span { display: block; margin-bottom: 12px; }
.estadistica strong { font-family: "ITC Avant Medium", sans-serif; font-size: clamp(22px, 4vw, 26px); }
.estadistica-grande { grid-column: 1 / -1; }

.panel-seccion { min-width: 0; margin-bottom: 42px; }
.seccion-cabecera {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 14px;
}
.seccion-cabecera > strong { font-family: "SF Medium", sans-serif; font-size: 14px; }
.admin-buscador { margin-bottom: 14px; }
.admin-buscador input { background: rgba(255, 250, 240, 0.75); }

.tabla-contenedor {
  max-width: 100%;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
}

table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; }
th, td { padding: 12px 14px; border-bottom: 1px solid var(--linea); vertical-align: middle; }
th { color: #68584d; font-family: "SF Medium", sans-serif; font-weight: 500; text-transform: uppercase; white-space: nowrap; }
td { font-family: "SF Regular", sans-serif; line-height: 1.45; }
tbody tr:last-child td { border-bottom: 0; }
tbody tr:hover { background: rgba(209, 195, 173, 0.2); }

.admin-categorias-controles {
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-btn-agregar,
.admin-categorias-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 8px 14px;
  border-radius: 3px;
  font-family: "SF Regular", sans-serif;
  font-size: 12px;
  transition: background 180ms ease;
}

.admin-btn-agregar {
  border: 1px solid var(--naranja);
  background: var(--naranja);
  color: #fff7e9;
  font-family: "SF Medium", sans-serif;
}

.admin-btn-agregar:hover {
  background: var(--naranja-oscuro);
}

.admin-categorias-toggle {
  border: 1px solid var(--linea);
  background: transparent;
  color: var(--tinta);
}

.admin-categorias-toggle:hover {
  background: rgba(209, 195, 173, 0.3);
}

.admin-categorias-toggle strong {
  font-family: "ITC Avant Medium", sans-serif;
}

.admin-categorias-flecha {
  display: inline-block;
  font-size: 18px;
  transition: transform 200ms ease;
}

.admin-categorias-flecha.is-open {
  transform: rotate(180deg);
}

.admin-form-categoria {
  margin-bottom: 16px;
  padding: 18px;
  border: 1px solid var(--linea);
  background: #e9decb;
}

.admin-form-categoria .portada-introduccion {
  margin-bottom: 4px;
  color: var(--naranja);
}

.admin-form-acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 6px;
}

.admin-form-acciones .boton-enviar {
  width: auto;
  flex: 1 1 180px;
  margin-top: 0;
}

.admin-form-acciones .boton-anterior {
  justify-content: center;
  min-height: 49px;
}

.admin-categoria-error {
  margin: 0 0 14px;
}

.admin-tabla-acciones {
  display: flex;
  gap: 6px;
}

.admin-btn-accion {
  background: rgba(255, 250, 240, 0.75);
  color: var(--tinta);
  font-family: "SF Medium", sans-serif;
  transition: background 150ms ease, border-color 150ms ease;
}

.admin-btn-accion:hover {
  border-color: var(--tinta);
  background: #e9decb;
}

.admin-btn-eliminar {
  border-color: var(--naranja);
  color: var(--naranja-oscuro);
}

.admin-btn-eliminar:hover {
  border-color: var(--naranja-oscuro);
  background: var(--naranja);
  color: #fff7e9;
}

/* Animación */

.categorias-desplegable-enter-active,
.categorias-desplegable-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.categorias-desplegable-enter-from,
.categorias-desplegable-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.etiqueta-borde,
.estado-tag {display: inline-block;padding: 4px 8px;border: 1px solid var(--linea);border-radius: 2px;font-size: 10px;white-space: nowrap;}
.vacio { margin: 0; padding: 18px; background: rgba(248, 241, 223, 0.65); font-size: 13px; }

.estado-resumen {display: grid;grid-template-columns: repeat(3, minmax(0, 1fr));gap: 8px;}
.estadistica-fila { display: flex; align-items: center; gap: 10px; min-width: 0; padding: 13px; }
.estadistica-fila div { display: grid; gap: 4px; }
.estadistica-fila strong { font-family: "ITC Avant Medium", sans-serif; font-size: 20px; }
.punto { flex: 0 0 9px; width: 9px; height: 9px; border-radius: 50%; }
.punto-disponible { background: #66845c; }
.punto-alquilado { background: var(--naranja); }
.punto-frenado { background: #857666; }
.estado-disponible { border-color: #66845c; }
.estado-alquilado { border-color: var(--naranja); }
.estado-frenado { border-color: #857666; }
.estado-neutro { border-color: var(--linea); }

.productos-lista { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.producto-card { display: grid; grid-template-columns: minmax(90px, 0.8fr) minmax(0, 1.2fr); min-width: 0; border: 1px solid var(--linea); background: rgba(248, 241, 223, 0.85); }
.producto-card > img,
.producto-sin-foto { width: 100%; height: 100%; min-height: 150px; max-height: 220px; object-fit: cover; background: #e9decb; }
.producto-sin-foto { display: grid; place-items: center; padding: 8px; font-size: 11px; text-align: center; }
.producto-info { min-width: 0; padding: 13px; }
.producto-info h3 { margin: 4px 0 7px; font-family: "ITC Avant Medium", sans-serif; font-size: 16px; }
.producto-info > small { font-size: 10px; overflow-wrap: anywhere; }
.producto-descripcion { margin: 0 0 10px; font-family: "SF Regular", sans-serif; font-size: 11px; line-height: 1.4; }
.producto-datos { display: grid; gap: 4px; margin-bottom: 9px; font-size: 11px; }
.producto-datos strong { font-family: "SF Medium", sans-serif; }
.producto-datos small { font-size: 10px; font-weight: 400; }
.producto-datos span { color: #68584d; overflow-wrap: anywhere; }

@media (min-width: 700px) {
  .estadisticas { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .estadistica-grande { grid-column: auto; }
}

@media (max-width: 600px) {
  .admin-contenido { padding-top: 14px; }
  .admin-folio { gap: 8px; font-size: 9px; }
  .admin-folio button { font-size: 11px; }
  .estado-resumen { grid-template-columns: 1fr; }
  .productos-lista { grid-template-columns: 1fr; }
}

@media (max-width: 380px) {
  .admin-folio span { display: none; }
  .admin-saludo { padding: 16px; }
  th, td { padding: 10px; }
}
</style>