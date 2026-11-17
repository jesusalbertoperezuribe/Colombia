/**
 * ==============================================================================
 * MINI PORTAL DE COLOMBIA - LÓGICA DE DEPARTAMENTOS
 * Archivo: js/departamentos.js
 * Descripción: Consumo de la API Colombia, mapeo de imágenes locales de departamentos,
 * cálculo estadístico por región, filtro interactivo por zona geográfica y scroll.
 * ==============================================================================
 */

// R1: Constantes de configuración y selectores del DOM
const API_URL_DEPARTMENTS = 'https://api-colombia.com/api/v1/Department';
const CLAVE_SCROLL_DEPTOS = 'scroll_pos_departamentos';

// Imagen de respaldo vectorial SVG inline para casos imprevistos
const IMAGEN_DEPTO_FALLBACK = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f1f5f9"/><path d="M0,280 Q150,200 300,260 T600,220 L600,400 L0,400 Z" fill="%23bfdbfe"/><path d="M0,320 Q200,250 400,310 T600,280 L600,400 L0,400 Z" fill="%23003893" opacity="0.3"/><circle cx="480" cy="120" r="45" fill="%23fcd116"/><text x="300" y="370" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="%2300225b" text-anchor="middle">Territorio Colombiano</text></svg>`;

// Mapeo exhaustivo y verificado 1-a-1 de los 33 departamentos de la API contra los 33 archivos en img/
const MAPA_EXACTO_DEPARTAMENTOS = {
  "Arauca": "Arauca.jpg",
  "Atlántico": "Atlantico.jpg",
  "Boyacá": "Boyaca.jpg",
  "Caldas": "Caldas.jpg",
  "Cauca": "Cauca.jpg",
  "Chocó": "Choco.jpg",
  "Guainía": "Guainia.webp",
  "Guaviare": "Guaviare.webp",
  "Huila": "Huila.webp",
  "Amazonas": "Amazonas.JPG",
  "Nariño": "Narino.jpg",
  "Quindío": "Quindio.jpg",
  "Norte de Santander": "Norte de santander.jpg",
  "Putumayo": "Putumayo.jpg",
  "Risaralda": "risaralda.png",
  "San Andrés y Providencia": "San Andres.jpg",
  "Sucre": "Sucre.jpg",
  "Tolima": "Tolima.webp",
  "Vaupés": "Vaupes.jpg",
  "Vichada": "Vichada.jpg",
  "Antioquia": "Antioquia.webp",
  "Bogotá": "Bogota.jpeg",
  "Cundinamarca": "Cundinamarca.jpg",
  "Bolívar": "Bolivar.jpg",
  "Caquetá": "Caqueta.jpg",
  "Casanare": "Casanare.jpg",
  "Cesar": "Cecar.jpg",
  "Córdoba": "Cordoba.jpg",
  "La Guajira": "La Guajira.jpg",
  "Magdalena": "Magdalena.jpg",
  "Meta": "Meta.png",
  "Santander": "Santander.png",
  "Valle del Cauca": "Valle del cauca.jpg"
};

// Diccionario de correspondencia de Regiones Naturales de Colombia según regionId de la API
const MAPA_REGIONES = {
  1: 'Caribe',
  2: 'Pacífico',
  3: 'Orinoquía',
  4: 'Amazonía',
  5: 'Andina',
  6: 'Insular'
};

// Elementos de la interfaz de usuario
const loadingElement = document.getElementById('loading');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('error-message');
const btnRetry = document.getElementById('btn-retry');
const departmentsContainer = document.getElementById('departments-container');
const regionsSummaryContainer = document.getElementById('regions-summary');
const totalDepartmentsBadge = document.getElementById('total-departments-badge');

// Elementos del sistema de filtros
const inputSearchDepto = document.getElementById('input-search-depto');
const selectRegionFilter = document.getElementById('select-region-filter');
const btnResetDeptoFilters = document.getElementById('btn-reset-depto-filters');
const deptoFilteredCountElement = document.getElementById('depto-filtered-count');
const deptoTotalAvailableCountElement = document.getElementById('depto-total-available-count');

// Almacén en memoria de la lista completa de departamentos
let listaDepartamentosGlobal = [];

// R2: Manejo de estados visuales en la interfaz (Carga y Errores)
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

// R3: Formateo y validación estricta de tipos numéricos
const formatearNumero = (valor, sufijo = '') => {
  const numeroConvertido = Number(valor);

  if (Number.isNaN(numeroConvertido) || numeroConvertido <= 0) {
    return 'No disponible';
  }

  const formatoCO = numeroConvertido.toLocaleString('es-CO');
  return sufijo !== '' ? `${formatoCO} ${sufijo}` : formatoCO;
};

/**
 * Normaliza cadenas de texto para comparaciones flexibles sin tildes ni símbolos.
 * @param {string} texto - Texto a normalizar.
 * @returns {string} Cadena depurada en minúsculas.
 */
const normalizarCadena = (texto) => {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[^a-z0-9]/g, '');
};

/**
 * Determina el nombre oficial de la región geográfica según el objeto o regionId de la API.
 * @param {Object} depto - Objeto de departamento.
 * @returns {string} Nombre de la región natural.
 */
const obtenerNombreRegion = (depto) => {
  const { region, regionId } = depto;
  if (region && typeof region === 'object' && typeof region.name === 'string') {
    return region.name.trim();
  }
  if (regionId && MAPA_REGIONES[regionId]) {
    return MAPA_REGIONES[regionId];
  }
  return 'No Asignada';
};

/**
 * Resuelve la ruta exacta de la fotografía del departamento en la carpeta img/.
 * @param {string} nombreDepto - Nombre del departamento.
 * @returns {string} Ruta local codificada de la imagen en img/.
 */
const resolverImagenDepartamento = (nombreDepto) => {
  if (!nombreDepto) {
    return IMAGEN_DEPTO_FALLBACK;
  }

  // 1. Coincidencia directa por clave original
  if (MAPA_EXACTO_DEPARTAMENTOS[nombreDepto]) {
    return `img/${encodeURIComponent(MAPA_EXACTO_DEPARTAMENTOS[nombreDepto])}`;
  }

  // 2. Coincidencia normalizada sin tildes ni caracteres especiales
  const nombreLimpio = normalizarCadena(nombreDepto);
  for (const [clave, archivo] of Object.entries(MAPA_EXACTO_DEPARTAMENTOS)) {
    if (normalizarCadena(clave) === nombreLimpio) {
      return `img/${encodeURIComponent(archivo)}`;
    }
  }

  // 3. Coincidencia por inclusión de subcadena
  for (const [clave, archivo] of Object.entries(MAPA_EXACTO_DEPARTAMENTOS)) {
    const claveLimpia = normalizarCadena(clave);
    if (nombreLimpio.includes(claveLimpia) || claveLimpia.includes(nombreLimpio)) {
      return `img/${encodeURIComponent(archivo)}`;
    }
  }

  return IMAGEN_DEPTO_FALLBACK;
};

// Manejador del evento onerror para reemplazar automáticamente imágenes rotas
window.manejarErrorImagenDepto = (elementoImg) => {
  if (elementoImg) {
    elementoImg.onerror = null;
    elementoImg.src = IMAGEN_DEPTO_FALLBACK;
  }
};

// R4: Lógica de cálculo y agrupación por región (Extra obligatorio)
const calcularConteoPorRegion = (departamentos) => {
  const conteoRegiones = {};

  departamentos.forEach((depto) => {
    const nombreRegion = obtenerNombreRegion(depto);

    if (conteoRegiones[nombreRegion] === undefined) {
      conteoRegiones[nombreRegion] = 0;
    }
    conteoRegiones[nombreRegion] += 1;
  });

  return conteoRegiones;
};

const renderizarResumenRegiones = (departamentos) => {
  if (!regionsSummaryContainer || !totalDepartmentsBadge) {
    return;
  }

  const totalDeptos = Number(departamentos.length);
  totalDepartmentsBadge.textContent = `Total: ${formatearNumero(totalDeptos)} departamentos`;

  const conteo = calcularConteoPorRegion(departamentos);
  regionsSummaryContainer.innerHTML = '';

  Object.entries(conteo).forEach(([nombreRegion, cantidad]) => {
    const cantidadNumerica = Number(cantidad);

    const regionCard = document.createElement('article');
    regionCard.className = 'region-card';
    regionCard.title = `Haz clic para filtrar por la región ${nombreRegion}`;
    regionCard.innerHTML = `
      <p class="region-name">${nombreRegion}</p>
      <p class="region-count">${formatearNumero(cantidadNumerica)}</p>
      <span class="region-label">departamentos</span>
    `;

    // Interacción extra: Al hacer clic en una tarjeta de región, se activa el filtro inmediatamente
    regionCard.addEventListener('click', () => {
      if (selectRegionFilter) {
        selectRegionFilter.value = nombreRegion;
        ejecutarFiltro();

        // Destacar visualmente la tarjeta de región seleccionada
        document.querySelectorAll('.region-card').forEach((c) => c.classList.remove('active'));
        regionCard.classList.add('active');
      }
    });

    regionsSummaryContainer.appendChild(regionCard);
  });
};

// R5: Renderizado dinámico de tarjetas de departamentos con fotografía local en el DOM
const renderizarDepartamentos = (departamentos) => {
  if (!departmentsContainer) {
    return;
  }

  departmentsContainer.innerHTML = '';

  // Caso: No hay resultados tras filtrar
  if (departamentos.length === 0) {
    departmentsContainer.innerHTML = `
      <div class="empty-results-state">
        <div class="empty-icon" aria-hidden="true">🗺️</div>
        <h3>No se encontraron departamentos</h3>
        <p>No hay departamentos que coincidan con los criterios de búsqueda seleccionados.</p>
        <button type="button" class="btn-retry" onclick="document.getElementById('btn-reset-depto-filters').click();">
          Mostrar todos los departamentos
        </button>
      </div>
    `;
    return;
  }

  departamentos.forEach((departamento) => {
    // Desestructuración de propiedades
    const { name, description, population, surface, cityCapital } = departamento;

    const nombreRegion = obtenerNombreRegion(departamento);
    const nombreDepto = (name && typeof name === 'string') ? name.trim() : 'Departamento';
    const nombreCapital = (cityCapital && typeof cityCapital === 'object' && cityCapital.name)
      ? cityCapital.name.trim()
      : 'Capital no disponible';

    // Se asigna la imagen que tiene el nombre de cada departamento en la carpeta img/
    const fotoUrl = resolverImagenDepartamento(nombreDepto);

    const poblacionTexto = formatearNumero(population);
    const superficieTexto = formatearNumero(surface, 'km²');
    const descripcionTexto = (description && typeof description === 'string' && description.trim() !== '')
      ? description.trim()
      : 'Información general en proceso de actualización geográfica para este territorio.';

    const card = document.createElement('article');
    card.className = 'card-depto';
    card.innerHTML = `
      <div class="card-media-wrapper">
        <img 
          src="${fotoUrl}" 
          alt="Paisaje de ${nombreDepto}" 
          class="card-media-img" 
          loading="lazy"
          onerror="window.manejarErrorImagenDepto(this);"
        />
        <span class="badge-region">${nombreRegion}</span>
      </div>
      <header class="card-depto-header">
        <h3 class="card-depto-title">${nombreDepto}</h3>
        <small style="color: var(--co-blue-dark); font-weight: 600; display: block; margin-top: 0.2rem;">
          🏛️ Capital: ${nombreCapital}
        </small>
      </header>
      <div class="card-depto-body">
        <p class="card-depto-description">${descripcionTexto}</p>
      </div>
      <footer class="card-depto-footer">
        <div class="metric-item">
          <span class="metric-label">Población</span>
          <span class="metric-value">${poblacionTexto}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Superficie</span>
          <span class="metric-value">${superficieTexto}</span>
        </div>
      </footer>
    `;

    departmentsContainer.appendChild(card);
  });
};

// R6: Sistema de Filtros por Zona Geográfica (Región) y Búsqueda Textual
/**
 * Puebla el menú selector con las regiones naturales disponibles.
 * @param {Array<Object>} departamentos - Listado de departamentos.
 */
const poblarFiltroRegiones = (departamentos) => {
  if (!selectRegionFilter) {
    return;
  }

  const regionesUnicas = new Set();
  departamentos.forEach((depto) => {
    const region = obtenerNombreRegion(depto);
    if (region && region !== 'No Asignada') {
      regionesUnicas.add(region);
    }
  });

  const listaOrdenada = Array.from(regionesUnicas).sort((a, b) => a.localeCompare(b, 'es'));

  selectRegionFilter.innerHTML = '<option value="todas">Todas las zonas geográficas</option>';
  listaOrdenada.forEach((region) => {
    const option = document.createElement('option');
    option.value = region;
    option.textContent = `Región ${region}`;
    selectRegionFilter.appendChild(option);
  });
};

/**
 * Filtra los departamentos en tiempo real según la zona geográfica y el término de búsqueda.
 */
const ejecutarFiltro = () => {
  const queryBusqueda = (inputSearchDepto ? inputSearchDepto.value : '').trim();
  const queryNormalizada = normalizarCadena(queryBusqueda);
  const regionSeleccionada = selectRegionFilter ? selectRegionFilter.value : 'todas';

  const departamentosFiltrados = listaDepartamentosGlobal.filter((depto) => {
    const { name, description, cityCapital } = depto;

    const nombreNorm = normalizarCadena(name);
    const descNorm = normalizarCadena(description);
    const capitalNorm = cityCapital ? normalizarCadena(cityCapital.name) : '';
    const regionActual = obtenerNombreRegion(depto);

    const coincideTexto = queryNormalizada === '' ||
      nombreNorm.includes(queryNormalizada) ||
      capitalNorm.includes(queryNormalizada) ||
      descNorm.includes(queryNormalizada);

    const coincideRegion = regionSeleccionada === 'todas' || regionActual === regionSeleccionada;

    return coincideTexto && coincideRegion;
  });

  // Renderiza únicamente los departamentos filtrados
  renderizarDepartamentos(departamentosFiltrados);

  // Actualiza los contadores de feedback del filtro
  if (deptoFilteredCountElement) {
    deptoFilteredCountElement.textContent = Number(departamentosFiltrados.length).toLocaleString('es-CO');
  }
  if (deptoTotalAvailableCountElement) {
    deptoTotalAvailableCountElement.textContent = Number(listaDepartamentosGlobal.length).toLocaleString('es-CO');
  }

  // Sincronizar estilo activo en las tarjetas de regiones superiores
  document.querySelectorAll('.region-card').forEach((card) => {
    const cardRegionName = card.querySelector('.region-name')?.textContent.trim();
    if (regionSeleccionada !== 'todas' && cardRegionName === regionSeleccionada) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
};

// R7: Persistencia y Restauración de la Posición de Scroll
const guardarPosicionScroll = () => {
  sessionStorage.setItem(CLAVE_SCROLL_DEPTOS, String(window.scrollY));
};

const restaurarPosicionScroll = () => {
  const scrollGuardado = sessionStorage.getItem(CLAVE_SCROLL_DEPTOS);
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
const obtenerDepartamentos = async () => {
  alternarLoader(true);
  limpiarErrorUI();

  try {
    const respuesta = await fetch(API_URL_DEPARTMENTS);

    if (!respuesta.ok) {
      throw new Error(`Respuesta fallida del servidor (Código HTTP: ${respuesta.status} - ${respuesta.statusText})`);
    }

    const datos = await respuesta.json();

    if (!Array.isArray(datos) || datos.length === 0) {
      throw new Error('La API respondió satisfactoriamente, pero no devolvió departamentos registrados.');
    }

    // Guarda los datos en memoria para los filtros
    listaDepartamentosGlobal = datos;

    // R4 Extra: Conteo y resumen de departamentos agrupados por región
    renderizarResumenRegiones(datos);

    // R6: Poblar menú selector y ejecutar renderizado filtrado
    poblarFiltroRegiones(datos);
    ejecutarFiltro();

    // R7: Restaura la posición del scroll exactamente donde el usuario la dejó
    restaurarPosicionScroll();

  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    mostrarErrorUI(
      error instanceof Error
        ? error.message
        : 'No fue posible conectarse con la API de Colombia. Por favor, verifica tu conexión.'
    );
  } finally {
    alternarLoader(false);
  }
};

// R9: Asignación de Eventos del Sistema
if (inputSearchDepto) {
  inputSearchDepto.addEventListener('input', ejecutarFiltro);
}

if (selectRegionFilter) {
  selectRegionFilter.addEventListener('change', ejecutarFiltro);
}

if (btnResetDeptoFilters) {
  btnResetDeptoFilters.addEventListener('click', () => {
    if (inputSearchDepto) inputSearchDepto.value = '';
    if (selectRegionFilter) selectRegionFilter.value = 'todas';
    ejecutarFiltro();
  });
}

if (btnRetry) {
  btnRetry.addEventListener('click', () => {
    obtenerDepartamentos();
  });
}

// Guardar posición de scroll continuamente y al salir de la página
window.addEventListener('scroll', guardarPosicionScroll, { passive: true });
window.addEventListener('beforeunload', guardarPosicionScroll);

document.addEventListener('DOMContentLoaded', () => {
  obtenerDepartamentos();
});
