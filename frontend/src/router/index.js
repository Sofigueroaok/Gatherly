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
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

// Mismo patrón que la clase 11: revisar la sesión antes de entrar a una ruta.
router.beforeEach(async (to, from, next) => {
  const requiereAuth = to.matched.some(ruta => ruta.meta.requiresAuth)
  if (!supabase) return requiereAuth ? next({ name: 'login' }) : next()

  const { data: { session } } = await supabase.auth.getSession()
  if (requiereAuth && !session) next({ name: 'login' })
  else if (session && ['portada', 'login', 'registro'].includes(to.name)) next({ name: 'inicio' })
  else next()
})

export default router
