/**
 * ==============================================================================
 * MINI PORTAL DE COLOMBIA - LÓGICA DE PLATOS TÍPICOS
 * Archivo: js/platos.js
 * Descripción: Consumo de la API Colombia, mapeo 100% exacto de imágenes locales,
 * sistema de filtros interactivos y persistencia de posición de scroll.
 * ==============================================================================
 */

// R1: Constantes de configuración y elementos del DOM
const API_URL_DISHES = 'https://api-colombia.com/api/v1/TypicalDish';
const CLAVE_SCROLL_PLATOS = 'scroll_pos_sabores_colombia';

// Imagen de respaldo vectorial SVG inline para casos excepcionales
const IMAGEN_PLATO_FALLBACK = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f1f5f9"/><circle cx="300" cy="170" r="70" fill="%23e2e8f0"/><path d="M250,170 Q300,110 350,170" stroke="%2394a3b8" stroke-width="6" fill="none"/><circle cx="300" cy="170" r="25" fill="%23fcd116"/><text x="300" y="275" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="%2300225b" text-anchor="middle">Sabores Tradicionales</text><text x="300" y="305" font-family="system-ui, sans-serif" font-size="14" fill="%2364748b" text-anchor="middle">Plato Típico de Colombia</text></svg>`;

// Mapeo exhaustivo y verificado 1-a-1 de los 68 platos de la API contra los 68 archivos en img/
const MAPA_EXACTO_PLATOS = {
  "Bandeja Paisa": "Bandeja paisa.jpg",
  "Sancocho Antioqueño": "La-Buena-Sancocho-antioqueno-780.webp",
  "Ajiaco Santafereño": "ajiaco santafereno.jpg",
  "Sancocho de Gallina": "sancocho-de-gallina-1594-1.gif",
  "Lechona Tolimense": "Lechona-tolimense.webp",
  "Arepas de Huevo": "arepas de huevo.jpg",
  "Mazamorra Chiquita": "mazamorra chiquita.jpg",
  "Sobrebarriga al Horno": "Sobrebarriga al horno.jpg",
  "Arroz Atollado": "arroz atollado.jpg",
  "Tamal Tolimense": "tamal tolimense.jpg",
  "Arroz con Coco": "arroz con coco.jpg",
  "Cabrito Asado": "cabrito asado.jpg",
  "Pepitoria": "pepitoria.jpg",
  "Cuy Asado": "Cuy-Asado-de-Narino.jpg",
  "Empanadas de Pipián": "empanadas de pipian.webp",
  "Arroz de Lisa": "arroz-de-lisa-colombia.jpg",
  "Butifarra Soledeña": "butifarra soledena.jpg",
  "Asado Huilense": "asado huilense.jpg",
  "Champús": "cahmpus.gif",
  "Sopa de Carantanta": "sopa de carantatan.jpg",
  "Caldo de Pirarucú": "caldo de pirarucu.jpg",
  "Chivo Guisado": "chivo guisado.jpg",
  "Tacacho con Cecina": "tacacho con cecina.jpg",
  "Arepa ocañera": "arapa ocanera.jpg",
  "Arroz clavado": "arroz clavado.jpg",
  "Mote de queso": "mote de queso.jpg",
  "Cayeye": "Cayeye.jpg",
  "Arepa guajira": "arepa guajira.jpg",
  "Ternera a la llanera": "ternera a la llanera.jpg",
  "Natilla": "NatillaColombiana.jpg",
  "Pescado muquiao": "pescado muquiado.webp",
  "Pisillo de chigüiro": "pisillo de chiguire.jpg",
  "Chicharrón": "chicharron.jpg",
  "Sancocho de pescado": "sancocho de pescado.jpg",
  "Casabe": "Casabe.webp",
  "Pan de arroz": "pan de arroz.jpg",
  "Maito de pescado": "maito de pescado.jpg",
  "Chorizo \u200B\u200BSantarrosano": "choriso santarrozano.jpg",
  "Chorizo ​​Santarrosano": "choriso santarrozano.jpg",
  "Chorizo Santarrosano": "choriso santarrozano.jpg",
  "Cachama Asada": "cachama asada.jpg",
  "Sopa de Cangrejo": "sopa de cangrejo.avif",
  "Mojarra frita": "mojarra-frita.webp",
  "Quiñapirá": "quinapira.jpg",
  "Dulce de guayaba": "dulce de guayaba.jpg",
  "Posta cartagenera": "posta cartagenera.jpg",
  "Changua": "changua.jpg",
  "Encocado": "encocado.webp",
  "Mute santandereano": "mute santandereano.jpg",
  "Mondongo": "mondongo.avif",
  "Caldo de costilla": "caldo de costilla.jpg",
  "Oblea": "oblea.webp",
  "Migao": "migajao.jpg",
  "Chuleta valluna": "chuleta valluna.jpg",
  "Envuelto de maíz": "envuelto de maiz.jpg",
  "Arroz con leche": "arroz con leche.jpg",
  "Tamal antioqueño": "tamal antioqueno.jpg",
  "Chorizo antioqueño": "chorizo-antioqueno.webp",
  "Mamona": "mamona.jpg",
  "Empanada de maíz": "empanada de maiz.jpg",
  "Arroz con pollo": "arroz con pollo.jpg",
  "Pan de yuca": "pan de yuca.webp",
  "Merengón": "merengon.jpeg",
  "Breva con arequipe": "breva con arequipe.jpg",
  "Agua de panela": "Aguapanela-Colombiana-3-2.jpg",
  "Carimañola": "carimanola.avif",
  "Gelatina de pata": "gelatina de pata.jpg",
  "Lengua sudada": "lengua de sudada.jpg",
  "Pollo asado": "pollo asado.webp",
  "Cazuela de mariscos": "casuela de mariscos.webp"
};

// Elementos de la interfaz gráfica
const loadingElement = document.getElementById('loading');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('error-message');
const btnRetry = document.getElementById('btn-retry');
const dishesContainer = document.getElementById('dishes-container');
const totalDishesCounter = document.getElementById('total-dishes-counter');

// Elementos del sistema de filtros
const inputSearchDish = document.getElementById('input-search-dish');
const selectDeptFilter = document.getElementById('select-dept-filter');
const btnResetFilters = document.getElementById('btn-reset-filters');
const filteredCountElement = document.getElementById('filtered-count');
const totalAvailableCountElement = document.getElementById('total-available-count');

// Almacén en memoria de los platos obtenidos
let listaPlatosGlobal = [];

// R2: Manejo de estados visuales de la interfaz (Loading y Errores)
const alternarLoader = (visible) => {
  if (visible) {
    loadingElement.classList.remove('hidden');
  } else {
    loadingElement.classList.add('hidden');
  }
};

const mostrarErrorUI = (mensaje) => {
  if (errorMessage && errorContainer) {
    errorMessage.textContent = mensaje;
    errorContainer.classList.remove('hidden');
  }
};

const limpiarErrorUI = () => {
  if (errorContainer) {
    errorContainer.classList.add('hidden');
  }
};

// R3: Normalización robusta y resolución de imágenes locales
/**
 * Limpia y normaliza texto eliminando acentos, caracteres invisibles (zero-width) y signos.
 * @param {string} texto - Texto a normalizar.
 * @returns {string} Cadena depurada alfanumérica en minúsculas.
 */
const normalizarCadena = (texto) => {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')       // Elimina acentos/tildes
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Elimina zero-width spaces que vienen en la API
    .replace(/[^a-z0-9]/g, '');           // Conserva solo caracteres alfanuméricos
};

/**
 * Resuelve la ruta exacta de la imagen en img/ para cada plato según su nombre.
 * @param {string} nombrePlato - Nombre del plato típico de la API.
 * @returns {string} Ruta al archivo local en img/.
 */
const resolverImagenComida = (nombrePlato) => {
  if (!nombrePlato) {
    return IMAGEN_PLATO_FALLBACK;
  }

  // 1. Coincidencia directa por clave original
  if (MAPA_EXACTO_PLATOS[nombrePlato]) {
    return `img/${encodeURIComponent(MAPA_EXACTO_PLATOS[nombrePlato])}`;
  }

  // 2. Coincidencia normalizada (elimina diferencias de acentos y caracteres invisibles)
  const nombreLimpio = normalizarCadena(nombrePlato);
  for (const [nombreClave, archivo] of Object.entries(MAPA_EXACTO_PLATOS)) {
    if (normalizarCadena(nombreClave) === nombreLimpio) {
      return `img/${encodeURIComponent(archivo)}`;
    }
  }

  // 3. Coincidencia por inclusión de subcadena
  for (const [nombreClave, archivo] of Object.entries(MAPA_EXACTO_PLATOS)) {
    const claveLimpia = normalizarCadena(nombreClave);
    if (nombreLimpio.includes(claveLimpia) || claveLimpia.includes(nombreLimpio)) {
      return `img/${encodeURIComponent(archivo)}`;
    }
  }

  // 4. Fallback de respaldo
  return IMAGEN_PLATO_FALLBACK;
};

// Manejador del evento onerror para reemplazar automáticamente imágenes rotas
window.manejarErrorImagen = (elementoImg) => {
  if (elementoImg) {
    elementoImg.onerror = null;
    elementoImg.src = IMAGEN_PLATO_FALLBACK;
  }
};

// R4: Lógica de conteo total de platos (Extra obligatorio)
const actualizarContadorTotal = (total) => {
  if (!totalDishesCounter) {
    return;
  }

  const conteoNumerico = Number(total);

  if (Number.isNaN(conteoNumerico) || conteoNumerico < 0) {
    totalDishesCounter.textContent = '0';
    return;
  }

  totalDishesCounter.textContent = conteoNumerico.toLocaleString('es-CO');
};

// R5: Renderizado dinámico de tarjetas de comidas en el DOM
const renderizarPlatos = (platos) => {
  if (!dishesContainer) {
    return;
  }

  dishesContainer.innerHTML = '';

  // Caso: No se encontraron resultados tras aplicar filtros
  if (platos.length === 0) {
    dishesContainer.innerHTML = `
      <div class="empty-results-state">
        <div class="empty-icon" aria-hidden="true">🍲</div>
        <h3>No se encontraron platos</h3>
        <p>No hay recetas típicas que coincidan con los criterios de búsqueda seleccionados.</p>
        <button type="button" class="btn-retry" onclick="document.getElementById('btn-reset-filters').click();">
          Mostrar todos los platos
        </button>
      </div>
    `;
    return;
  }

  platos.forEach((plato) => {
    // Desestructuración de propiedades
    const { name, description, department } = plato;

    let nombreDepartamento = 'Colombia';
    if (department && typeof department === 'object' && typeof department.name === 'string') {
      nombreDepartamento = department.name.trim();
    }

    const nombrePlato = (name && typeof name === 'string' && name.trim() !== '')
      ? name.trim()
      : 'Plato Tradicional';

    // Obtener la imagen correspondiente verificada
    const rutaImagen = resolverImagenComida(nombrePlato);

    const descripcionTexto = (description && typeof description === 'string' && description.trim() !== '')
      ? description.trim()
      : 'Receta e ingrediente representativo del patrimonio culinario colombiano.';

    const card = document.createElement('article');
    card.className = 'card-dish';
    card.innerHTML = `
      <div class="card-dish-image-wrapper">
        <img 
          src="${rutaImagen}" 
          alt="${nombrePlato}" 
          class="card-dish-img" 
          loading="lazy"
          onerror="window.manejarErrorImagen(this);"
        />
        <span class="badge-dept">📍 ${nombreDepartamento}</span>
      </div>
      <div class="card-dish-content">
        <h3 class="card-dish-title">${nombrePlato}</h3>
        <p class="card-dish-desc">${descripcionTexto}</p>
      </div>
    `;

    dishesContainer.appendChild(card);
  });
};

// R6: Sistema de Filtros Interactivo (Búsqueda textual y por Departamento)
/**
 * Puebla el menú desplegable de departamentos con opciones únicas ordenadas alfabéticamente.
 * @param {Array<Object>} platos - Lista completa de platos.
 */
const poblarFiltroDepartamentos = (platos) => {
  if (!selectDeptFilter) {
    return;
  }

  const departamentosUnicos = new Set();

  platos.forEach((plato) => {
    const { department } = plato;
    if (department && typeof department === 'object' && typeof department.name === 'string') {
      const nombreLimpio = department.name.trim();
      if (nombreLimpio !== '') {
        departamentosUnicos.add(nombreLimpio);
      }
    }
  });

  const listaOrdenada = Array.from(departamentosUnicos).sort((a, b) => a.localeCompare(b, 'es'));

  selectDeptFilter.innerHTML = '<option value="todos">Todos los departamentos</option>';
  listaOrdenada.forEach((nombreDepto) => {
    const option = document.createElement('option');
    option.value = nombreDepto;
    option.textContent = nombreDepto;
    selectDeptFilter.appendChild(option);
  });
};

/**
 * Filtra los platos en tiempo real según el texto de búsqueda y el departamento seleccionado.
 */
const ejecutarFiltro = () => {
  const queryBusqueda = (inputSearchDish ? inputSearchDish.value : '').trim();
  const queryNormalizada = normalizarCadena(queryBusqueda);
  const deptoSeleccionado = selectDeptFilter ? selectDeptFilter.value : 'todos';

  const platosFiltrados = listaPlatosGlobal.filter((plato) => {
    const { name, description, department } = plato;

    const nombreNorm = normalizarCadena(name);
    const descNorm = normalizarCadena(description);
    const deptoActual = (department && department.name) ? department.name.trim() : '';

    const coincideTexto = queryNormalizada === '' || nombreNorm.includes(queryNormalizada) || descNorm.includes(queryNormalizada);
    const coincideDepto = deptoSeleccionado === 'todos' || deptoActual === deptoSeleccionado;

    return coincideTexto && coincideDepto;
  });

  renderizarPlatos(platosFiltrados);

  if (filteredCountElement) {
    filteredCountElement.textContent = Number(platosFiltrados.length).toLocaleString('es-CO');
  }
  if (totalAvailableCountElement) {
    totalAvailableCountElement.textContent = Number(listaPlatosGlobal.length).toLocaleString('es-CO');
  }
};

// R7: Persistencia y Restauración de la Posición de Scroll (Para no volver arriba)
const guardarPosicionScroll = () => {
  sessionStorage.setItem(CLAVE_SCROLL_PLATOS, String(window.scrollY));
};

const restaurarPosicionScroll = () => {
  const scrollGuardado = sessionStorage.getItem(CLAVE_SCROLL_PLATOS);
  if (scrollGuardado !== null) {
    const posicionY = Number(scrollGuardado);
    if (!Number.isNaN(posicionY) && posicionY > 0) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          window.scrollTo({
            top: posicionY,
            behavior: 'smooth'
          });
        }, 120);
      });
    }
  }
};

// R8: Consumo asíncrono de la API mediante Fetch y Async/Await
const obtenerPlatosTipicos = async () => {
  alternarLoader(true);
  limpiarErrorUI();

  try {
    const respuesta = await fetch(API_URL_DISHES);

    if (!respuesta.ok) {
      throw new Error(`Error en el servidor al consultar los platos (Código HTTP: ${respuesta.status} - ${respuesta.statusText})`);
    }

    const datos = await respuesta.json();

    if (!Array.isArray(datos) || datos.length === 0) {
      throw new Error('La API respondió satisfactoriamente, pero no devolvió platos típicos registrados.');
    }

    listaPlatosGlobal = datos;

    actualizarContadorTotal(datos.length);
    poblarFiltroDepartamentos(datos);
    ejecutarFiltro();

    // R7: Restaura la posición de scroll
    restaurarPosicionScroll();

  } catch (error) {
    console.error('Error al obtener platos típicos:', error);
    mostrarErrorUI(
      error instanceof Error
        ? error.message
        : 'Ocurrió un problema de conectividad al consultar el menú de platos tradicionales.'
    );
    actualizarContadorTotal(0);
  } finally {
    alternarLoader(false);
  }
};

// R9: Asignación de Eventos del Sistema
if (inputSearchDish) {
  inputSearchDish.addEventListener('input', ejecutarFiltro);
}

if (selectDeptFilter) {
  selectDeptFilter.addEventListener('change', ejecutarFiltro);
}

if (btnResetFilters) {
  btnResetFilters.addEventListener('click', () => {
    if (inputSearchDish) inputSearchDish.value = '';
    if (selectDeptFilter) selectDeptFilter.value = 'todos';
    ejecutarFiltro();
  });
}

if (btnRetry) {
  btnRetry.addEventListener('click', () => {
    obtenerPlatosTipicos();
  });
}

window.addEventListener('scroll', guardarPosicionScroll, { passive: true });
window.addEventListener('beforeunload', guardarPosicionScroll);

document.addEventListener('DOMContentLoaded', () => {
  obtenerPlatosTipicos();
});
