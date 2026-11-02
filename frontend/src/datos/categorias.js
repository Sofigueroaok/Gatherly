import camara from '../assets/categorias.images/FOTO&VIDEO.png'
import herramientas from '../assets/categorias.images/HERRAMIENTAS.png'
import camping from '../assets/categorias.images/CAMPING.png'
import hogar from '../assets/categorias.images/CASA&HOGAR.png'
import fiestas from '../assets/categorias.images/FIESTA&EVENTOS.png'
import musica from '../assets/categorias.images/MUSICA&HIFI.png'

export const categorias = [
  { nombre: 'Foto & video', titulo: ['Foto', '& video'], detalles: ['CÁMARAS', 'LENTES', 'ACCESORIOS'], imagen: camara, acento: '#ef3519' },
  { nombre: 'Taller & oficio', titulo: ['Taller', '& oficio'], detalles: ['HERRAMIENTAS', 'EQUIPOS', 'PROYECTOS'], imagen: herramientas, acento: '#ffe0a1' },
  { nombre: 'Camping & aventura', titulo: ['Camping', '& aventura'], detalles: ['CARPAS', 'MOCHILAS', 'AIRE LIBRE'], imagen: camping, acento: '#f2d977' },
  { nombre: 'Casa & diseño', titulo: ['Casa', '& diseño'], detalles: ['COCINA', 'ELECTRODOMÉSTICOS', 'HOGAR'], imagen: hogar, acento: '#ffd8ac' },
  { nombre: 'Mesa & eventos', titulo: ['Mesa', '& eventos'], detalles: ['VAJILLA', 'ILUMINACIÓN', 'DECORACIÓN'], imagen: fiestas, acento: '#fff0d8' },
  { nombre: 'Música & sonido', titulo: ['Música', '& sonido'], detalles: ['SONIDO', 'INSTRUMENTOS', 'EQUIPOS'], imagen: musica, acento: '#fff0d8' }
]
