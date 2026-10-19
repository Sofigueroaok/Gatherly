const { createApp, ref, onMounted } = Vue;

createApp({
  setup() {
    // Configuración de Supabase
    const supabaseUrl = ref(localStorage.getItem('RITUAL_SB_URL') || '');
    const supabaseKey = ref(localStorage.getItem('RITUAL_SB_KEY') || '');
    const isConfigured = ref(false);
    let supabase = null;

    // Estado de Autenticación
    const currentUser = ref(null);
    const authMode = ref('login'); // 'login' | 'register'
    const authForm = ref({
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      telefono: null,
      direccion: ''
    });

    // Estado general del panel
    const currentTab = ref('productos');
    const loading = ref(false);
    const notification = ref({ show: false, message: '', type: 'success' });

    // Tablas de base de datos
    const productos = ref([]);
    const categorias = ref([]);
    const pedidos = ref([]);
    const usuarios = ref([]);

    // Modales y Formularios CRUD
    const modal = ref({ visible: false, type: 'producto', isEdit: false, editId: null });

    const formProducto = ref({
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      marca: '',
      fecha_vencimiento: '',
      id_categoria: null
    });

    const formCategoria = ref({
      nombre: '',
      descripcion: ''
    });

    const formUsuario = ref({
      nombre: '',
      apellido: '',
      email: '',
      contrasena: '',
      telefono: null,
      direccion: '',
      id_rol: 1
    });

    // Notificaciones flash
    const notify = (message, type = 'success') => {
      notification.value = { show: true, message, type };
      setTimeout(() => {
        notification.value.show = false;
      }, 4500);
    };

    // Inicializar Supabase y revisar sesión
const initSupabase = async () => {
  // Limpiar espacios en blanco y quitar cualquier barra '/' al final de la URL
  const cleanUrl = supabaseUrl.value.trim().replace(/\/+$/, '');
  const cleanKey = supabaseKey.value.trim();

  if (!cleanUrl || !cleanKey) {
    notify('Ingresa tanto la URL como el Key de Supabase.', 'error');
    return;
  }

  try {
    // Inicializar con la URL sanitizada
    supabase = window.supabase.createClient(cleanUrl, cleanKey);
    
    // Guardar los valores limpios en el LocalStorage
    localStorage.setItem('RITUAL_SB_URL', cleanUrl);
    localStorage.setItem('RITUAL_SB_KEY', cleanKey);
    supabaseUrl.value = cleanUrl;
    supabaseKey.value = cleanKey;
    isConfigured.value = true;

    // Verificar si hay una sesión activa en Supabase Auth
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      currentUser.value = session.user;
      fetchAll();
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      currentUser.value = session ? session.user : null;
      if (session) {
        fetchAll();
      }
    });
  } catch (err) {
    notify('Error al conectar con Supabase: ' + err.message, 'error');
  }
};

    // ACCIÓN: Iniciar Sesión (Login)
    const handleLogin = async () => {
      loading.value = true;
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authForm.value.email,
          password: authForm.value.password
        });

        if (error) throw error;

        currentUser.value = data.user;
        notify('¡Bienvenida/o a Ritual Cosmética Natural!');
        authForm.value = { email: '', password: '', nombre: '', apellido: '', telefono: null, direccion: '' };
        await fetchAll();
      } catch (err) {
        notify('Error al iniciar sesión: ' + err.message, 'error');
      } finally {
        loading.value = false;
      }
    };

    // ACCIÓN: Registrarse (Crea en Auth y en tabla usuario)
    const handleRegister = async () => {
      loading.value = true;
      try {
        // 1. Crear el usuario en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: authForm.value.email,
          password: authForm.value.password
        });

        if (authError) throw authError;

        // 2. Insertar el perfil en tu tabla 'usuario'
        const { error: profileError } = await supabase.from('usuario').insert([{
          nombre: authForm.value.nombre,
          apellido: authForm.value.apellido,
          email: authForm.value.email,
          contrasena: '********', // Contraseña hasheada/protegida en Auth
          telefono: authForm.value.telefono || null,
          direccion: authForm.value.direccion || '',
          id_rol: 1
        }]);

        if (profileError) {
          console.warn('Advertencia al registrar en la tabla usuario:', profileError.message);
        }

        notify('Registro exitoso. Ya puedes acceder.');
        authMode.value = 'login';
      } catch (err) {
        notify('Error al registrar usuario: ' + err.message, 'error');
      } finally {
        loading.value = false;
      }
    };

    // ACCIÓN: Cerrar Sesión (Logout)
    const handleLogout = async () => {
      try {
        await supabase.auth.signOut();
        currentUser.value = null;
        notify('Has cerrado sesión correctamente.');
      } catch (err) {
        notify('Error al salir: ' + err.message, 'error');
      }
    };

    // Cargar datos de las tablas
    const fetchData = async (tab) => {
      if (!supabase || !currentUser.value) return;
      loading.value = true;
      try {
        if (tab === 'productos') {
          const { data, error } = await supabase.from('producto').select('*').order('id_producto', { ascending: true });
          if (error) throw error;
          productos.value = data || [];
        } else if (tab === 'categorias') {
          const { data, error } = await supabase.from('categoria').select('*').order('id_categoria', { ascending: true });
          if (error) throw error;
          categorias.value = data || [];
        } else if (tab === 'pedidos') {
          const { data, error } = await supabase.from('pedido').select('*').order('fecha', { ascending: false });
          if (error) throw error;
          pedidos.value = data || [];
        } else if (tab === 'usuarios') {
          const { data, error } = await supabase.from('usuario').select('*').order('id_usuario', { ascending: true });
          if (error) throw error;
          usuarios.value = data || [];
        }
      } catch (err) {
        notify(`Error al cargar ${tab}: ${err.message}`, 'error');
      } finally {
        loading.value = false;
      }
    };

    const fetchAll = async () => {
      await Promise.all([
        fetchData('categorias'),
        fetchData('productos'),
        fetchData('pedidos'),
        fetchData('usuarios')
      ]);
    };

    // Manejo de Modales
    const openModal = (type) => {
      modal.value = { visible: true, type, isEdit: false, editId: null };
      if (type === 'producto') {
        formProducto.value = { nombre: '', descripcion: '', precio: 0, stock: 0, marca: '', fecha_vencimiento: '', id_categoria: null };
      } else if (type === 'categoria') {
        formCategoria.value = { nombre: '', descripcion: '' };
      } else if (type === 'usuario') {
        formUsuario.value = { nombre: '', apellido: '', email: '', contrasena: '', telefono: null, direccion: '', id_rol: 1 };
      }
    };

    const editItem = (type, item) => {
      const editId = type === 'producto' ? item.id_producto : type === 'categoria' ? item.id_categoria : item.id_usuario;
      modal.value = { visible: true, type, isEdit: true, editId };

      if (type === 'producto') formProducto.value = { ...item };
      else if (type === 'categoria') formCategoria.value = { ...item };
      else if (type === 'usuario') formUsuario.value = { ...item };
    };

    const closeModal = () => {
      modal.value.visible = false;
    };

    // CRUD: Guardar Producto
    const saveProducto = async () => {
      loading.value = true;
      try {
        const payload = { ...formProducto.value };
        if (modal.value.isEdit) {
          const { error } = await supabase.from('producto').update(payload).eq('id_producto', modal.value.editId);
          if (error) throw error;
          notify('Producto actualizado.');
        } else {
          delete payload.id_producto;
          const { error } = await supabase.from('producto').insert([payload]);
          if (error) throw error;
          notify('Producto creado con éxito.');
        }
        closeModal();
        await fetchData('productos');
      } catch (err) {
        notify('Error con el producto: ' + err.message, 'error');
      } finally {
        loading.value = false;
      }
    };

    // CRUD: Guardar Categoría
    const saveCategoria = async () => {
      loading.value = true;
      try {
        const payload = { ...formCategoria.value };
        if (modal.value.isEdit) {
          const { error } = await supabase.from('categoria').update(payload).eq('id_categoria', modal.value.editId);
          if (error) throw error;
          notify('Categoría actualizada.');
        } else {
          delete payload.id_categoria;
          const { error } = await supabase.from('categoria').insert([payload]);
          if (error) throw error;
          notify('Categoría creada.');
        }
        closeModal();
        await fetchData('categorias');
      } catch (err) {
        notify('Error con la categoría: ' + err.message, 'error');
      } finally {
        loading.value = false;
      }
    };

    // CRUD: Guardar Usuario
    const saveUsuario = async () => {
      loading.value = true;
      try {
        const payload = { ...formUsuario.value };
        if (modal.value.isEdit) {
          delete payload.contrasena; // No sobreescribir password al editar perfil
          const { error } = await supabase.from('usuario').update(payload).eq('id_usuario', modal.value.editId);
          if (error) throw error;
          notify('Usuario actualizado.');
        } else {
          delete payload.id_usuario;
          const { error } = await supabase.from('usuario').insert([payload]);
          if (error) throw error;
          notify('Usuario registrado en la base de datos.');
        }
        closeModal();
        await fetchData('usuarios');
      } catch (err) {
        notify('Error al guardar usuario: ' + err.message, 'error');
      } finally {
        loading.value = false;
      }
    };

    // CRUD: Eliminar Registro
    const deleteItem = async (type, id) => {
      if (!confirm(`¿Deseas eliminar este registro de ${type}?`)) return;

      loading.value = true;
      try {
        const table = type;
        const idCol = type === 'producto' ? 'id_producto' : type === 'categoria' ? 'id_categoria' : 'id_usuario';

        const { error } = await supabase.from(table).delete().eq(idCol, id);
        if (error) throw error;

        notify(`${type} eliminado.`);
        await fetchData(type === 'producto' ? 'productos' : type === 'categoria' ? 'categorias' : 'usuarios');
      } catch (err) {
        notify('Error al eliminar: ' + err.message, 'error');
      } finally {
        loading.value = false;
      }
    };

    // Actualizar estado de pedido
    const updatePedidoStatus = async (pedido) => {
      const nuevoEstado = prompt('Nuevo estado (ej: Pagado, En preparación, Enviado, Entregado):', pedido.estado || '');
      if (nuevoEstado === null || nuevoEstado === pedido.estado) return;

      try {
        const { error } = await supabase
          .from('pedido')
          .update({ estado: nuevoEstado })
          .eq('id_pedido', pedido.id_pedido);
        if (error) throw error;
        pedido.estado = nuevoEstado;
        notify('Estado del pedido actualizado.');
      } catch (err) {
        notify('Error al actualizar estado: ' + err.message, 'error');
      }
    };

    const getCategoryName = (idCategoria) => {
      const cat = categorias.value.find(c => c.id_categoria === idCategoria);
      return cat ? cat.nombre : 'Sin categoría';
    };

    const getTabTitle = () => {
      const titles = {
        productos: 'Catálogo de Cosmética',
        categorias: 'Categorías Botánicas',
        pedidos: 'Gestión de Pedidos',
        usuarios: 'Directorio de Usuarios'
      };
      return titles[currentTab.value];
    };

    const getTabSubtitle = () => {
      const subtitles = {
        productos: 'Administra productos, precios, ingredientes y stock de Ritual.',
        categorias: 'Colecciones y líneas de cuidado natural.',
        pedidos: 'Control de ventas y logística.',
        usuarios: 'Gestión de clientes, administradores y roles de acceso.'
      };
      return subtitles[currentTab.value];
    };

    onMounted(() => {
      if (supabaseUrl.value && supabaseKey.value) {
        initSupabase();
      }
    });

    return {
      supabaseUrl,
      supabaseKey,
      isConfigured,
      initSupabase,
      currentUser,
      authMode,
      authForm,
      handleLogin,
      handleRegister,
      handleLogout,
      currentTab,
      loading,
      notification,
      productos,
      categorias,
      pedidos,
      usuarios,
      modal,
      formProducto,
      formCategoria,
      formUsuario,
      openModal,
      editItem,
      closeModal,
      saveProducto,
      saveCategoria,
      saveUsuario,
      deleteItem,
      updatePedidoStatus,
      getCategoryName,
      getTabTitle,
      getTabSubtitle,
      fetchData
    };
  }
}).mount('#app');