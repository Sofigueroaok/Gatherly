import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../supabase.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'portada', component: () => import('../views/AccesoView.vue') },
    { path: '/login', name: 'login', component: () => import('../views/AccesoView.vue') },
    { path: '/registro', name: 'registro', component: () => import('../views/AccesoView.vue') },
    { path: '/inicio', name: 'inicio', component: () => import('../views/InicioView.vue'), meta: { requiresAuth: true } },
    { path: '/publicar', name: 'publicar', component: () => import('../components/CrearProducto.vue'), meta: { requiresAuth: true } },
    { path: '/mis-publicaciones', name: 'mis-publicaciones', component: () => import('../views/MisProductosView.vue'), meta: { requiresAuth: true } },
    { path: '/editar/:id', name: 'editar-producto', component: () => import('../components/CrearProducto.vue'), meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' },

    // Ruta protegida para administradores
    { path: '/admin', name: 'admin', component: () => import('../views/AdminView.vue'), meta: { requiresAuth: true, requiresAdmin: true } }
  ]
})


// Mismo patrón que la clase 11: revisar la sesión antes de entrar a una ruta.
router.beforeEach(async (to, from, next) => {
  const requiereAuth = to.matched.some(ruta => ruta.meta.requiresAuth)
  const requiereAdmin = to.matched.some(ruta => ruta.meta.requiresAdmin)

  if (!supabase) return requiereAuth ? next({ name: 'login' }) : next()

  const { data: { session } } = await supabase.auth.getSession()
  if (requiereAuth && !session) next({ name: 'login' })
  else if (session && ['portada', 'login', 'registro'].includes(to.name)){next({ name: 'inicio' })
  }else if (requiereAdmin) {
    // Consultar el rol del usuario en public.usuario
  const { data: usuario, error } = await supabase
    .from('usuario')
    .select('id_rol')
    .eq('auth_id', session.user.id)
    .single()

  if (error) {
    console.error('Error al verificar el rol:', error)
    return next({ name: 'inicio' })
  }

  // El rol 2 corresponde al administrador
  const esAdmin = usuario.id_rol === 2

  return esAdmin ? next() : next({ name: 'inicio' })
}

return next()
})

export default router
