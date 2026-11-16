<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase.js'
import Inicio from '../components/Inicio.vue'

const router = useRouter()
const usuario = ref(null)
const cargando = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    if (!data.user) {
      await cerrarSesion()
      return
    }
    usuario.value = data.user
  } catch (err) {
    errorMsg.value = `No se pudo cargar tu sesión: ${err.message}`
  }
})

const cerrarSesion = async () => {
  if (cargando.value) return
  try {
    cargando.value = true
    errorMsg.value = ''
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    if (error) throw error
    router.replace({ name: 'login' })
  } catch (err) {
    errorMsg.value = `No se pudo cerrar sesión: ${err.message}`
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <Inicio v-if="usuario" :usuario="usuario" :cerrando="cargando" :error-sesion="errorMsg" @cerrar-sesion="cerrarSesion" />
  <div v-else-if="errorMsg" class="estado-sesion" role="alert">
    <p>{{ errorMsg }}</p>
    <button type="button" :disabled="cargando" @click="cerrarSesion">Volver al acceso</button>
  </div>
  <p v-else class="estado-sesion" role="status">Cargando tu sesión…</p>
</template>

<style scoped>
.estado-sesion { padding: 30px 22px; font: 14px 'SF Regular', sans-serif; }
</style>
