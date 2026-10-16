/**
 * ====================================================================
 * DIGI-API EXPLORER - CLIENTE JAVASCRIPT DIRECTO Y LIMPIO
 * Implementación del Método HTTP GET con Fetch API (async/await)
 * ====================================================================
 */

// URL Base de la API pública oficial
const API_BASE_URL = 'https://digi-api.com/api/v1';

// Elementos del DOM
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');
const randomBtn = document.getElementById('randomBtn');
const quickButtons = document.querySelectorAll('.quick-btn');

// Monitor de Petición HTTP
const requestUrlEl = document.getElementById('requestUrl');
const statusCodeBadge = document.getElementById('statusCodeBadge');
const responseTimeEl = document.getElementById('responseTime');

// Estados de Interfaz
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('errorMessage');
const errorDetails = document.getElementById('errorDetails');
const digimonContainer = document.getElementById('digimonContainer');

// Elementos de la Ficha del Digimon
const digimonIdEl = document.getElementById('digimonId');
const digimonNameEl = document.getElementById('digimonName');
const digimonImageEl = document.getElementById('digimonImage');
const digimonLevelEl = document.getElementById('digimonLevel');
const digimonAttributeEl = document.getElementById('digimonAttribute');
const digimonTypeEl = document.getElementById('digimonType');
const digimonFieldsEl = document.getElementById('digimonFields');
const digimonDescriptionEl = document.getElementById('digimonDescription');
const digimonSkillsEl = document.getElementById('digimonSkills');
const digimonGrid = document.getElementById('digimonGrid');

/**
 * ====================================================================
 * FUNCIÓN PRINCIPAL: CONSULTAR DIGIMON POR NOMBRE O ID (MÉTODO GET)
 * ====================================================================
 */
async function getDigimonDetails(identifier) {
  if (!identifier) return;

  const query = identifier.toString().trim().toLowerCase();
  const url = `${API_BASE_URL}/digimon/${encodeURIComponent(query)}`;

  // 1. Mostrar estado de carga y registrar URL en el monitor
  mostrarCargando(url);
  const startTime = performance.now();

  try {
    // PASO 1: Hacer la petición HTTP GET con fetch()
    const response = await fetch(url);
    const duration = Math.round(performance.now() - startTime);

    // PASO 2: Verificar si la respuesta fue exitosa (200 OK)
    if (!response.ok) {
      actualizarMonitor(url, response.status, duration, false);
      throw new Error(`Digimon "${identifier}" no encontrado (Código HTTP: ${response.status})`);
    }

    // PASO 3: Convertir la respuesta JSON a objeto JavaScript
    const data = await response.json();

    // Actualizar monitor a estado exitoso
    actualizarMonitor(url, response.status, duration, true);

    // PASO 4: Renderizar los datos directamente en la pantalla
    renderDigimon(data);

  } catch (error) {
    console.error('Error en la petición GET:', error);
    mostrarError(error.message);
  }
}

/**
 * Renderiza los datos recibidos de la API directamente en el HTML
 */
function renderDigimon(data) {
  loader.style.display = 'none';
  errorMessage.style.display = 'none';
  digimonContainer.style.display = 'grid';

  // ID y Nombre
  digimonIdEl.textContent = `#${String(data.id).padStart(3, '0')}`;
  digimonNameEl.textContent = data.name || 'Unknown';

  // Imagen oficial
  digimonImageEl.src = (data.images && data.images.length > 0) 
    ? data.images[0].href 
    : 'https://via.placeholder.com/200?text=No+Image';
  digimonImageEl.alt = data.name;

  // Nivel, Atributo y Tipo (datos directos de la API)
  const levelText = (data.levels && data.levels.length > 0) 
    ? data.levels.map(l => l.level).join(' / ') 
    : 'None';
  digimonLevelEl.textContent = `Nivel: ${levelText}`;

  const attributeText = (data.attributes && data.attributes.length > 0) 
    ? data.attributes.map(a => a.attribute).join(' / ') 
    : 'None';
  digimonAttributeEl.textContent = `Atributo: ${attributeText}`;

  const typeText = (data.types && data.types.length > 0) 
    ? data.types.map(t => t.type).join(' / ') 
    : 'None';
  digimonTypeEl.textContent = `Tipo: ${typeText}`;

  // Familias y Campos Digitales
  digimonFieldsEl.innerHTML = '';
  if (data.fields && data.fields.length > 0) {
    data.fields.forEach(f => {
      const chip = document.createElement('div');
      chip.className = 'field-chip';
      chip.textContent = f.field;
      digimonFieldsEl.appendChild(chip);
    });
  } else {
    digimonFieldsEl.innerHTML = '<span class="field-chip">None</span>';
  }

  // Biografía / Descripción oficial de la API
  if (data.descriptions && data.descriptions.length > 0) {
    const desc = data.descriptions.find(d => d.language === 'en_us') || data.descriptions[0];
    digimonDescriptionEl.textContent = desc.description || 'No description available.';
  } else {
    digimonDescriptionEl.textContent = 'No official description available in the database.';
  }

  // Ataques y Habilidades (Skills)
  digimonSkillsEl.innerHTML = '';
  if (data.skills && data.skills.length > 0) {
    data.skills.slice(0, 5).forEach(s => {
      const item = document.createElement('div');
      item.className = 'skill-item';
      item.innerHTML = `
        <div class="skill-name">${s.skill}</div>
        <div class="skill-desc">${s.description || 'Signature combat attack.'}</div>
      `;
      digimonSkillsEl.appendChild(item);
    });
  } else {
    digimonSkillsEl.innerHTML = '<div class="skill-desc">No registered skills for this Digimon.</div>';
  }

  digimonContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * ====================================================================
 * CARGAR GALERÍA INICIAL CON MÉTODO GET
 * ====================================================================
 */
async function loadInitialGallery() {
  const url = `${API_BASE_URL}/digimon?pageSize=18`;

  try {
    const response = await fetch(url);
    if (!response.ok) return;

    const data = await response.json();
    const digimons = data.content || [];

    digimonGrid.innerHTML = '';
    digimons.forEach(digi => {
      const card = document.createElement('div');
      card.className = 'mini-card';
      card.title = `Consultar con GET a ${digi.name}`;
      card.innerHTML = `
        <img class="mini-card-img" src="${digi.image}" alt="${digi.name}" loading="lazy">
        <div class="mini-card-id">#${String(digi.id).padStart(3, '0')}</div>
        <div class="mini-card-name">${digi.name}</div>
      `;

      card.addEventListener('click', () => {
        searchInput.value = digi.name;
        clearBtn.style.display = 'block';
        getDigimonDetails(digi.id);
      });

      digimonGrid.appendChild(card);
    });
  } catch (error) {
    console.warn('Error al cargar la galería:', error);
  }
}

/**
 * Obtener Digimon Aleatorio con GET
 */
function getRandomDigimon() {
  const sampleIds = [1, 2, 3, 4, 5, 14, 15, 16, 17, 18, 83, 89, 93, 202, 206, 305, 315, 336, 358, 432, 591];
  const randomId = sampleIds[Math.floor(Math.random() * sampleIds.length)];
  searchInput.value = randomId;
  clearBtn.style.display = 'block';
  getDigimonDetails(randomId);
}

/**
 * Control visual de estados
 */
function mostrarCargando(url) {
  loader.style.display = 'block';
  errorMessage.style.display = 'none';
  digimonContainer.style.display = 'none';

  requestUrlEl.textContent = url;
  statusCodeBadge.textContent = 'CONSULTANDO...';
  statusCodeBadge.className = 'status-badge status-loading';
  responseTimeEl.textContent = 'En espera...';
}

function actualizarMonitor(url, status, duration, isOk) {
  requestUrlEl.textContent = url;
  responseTimeEl.textContent = `${duration} ms`;

  if (isOk) {
    statusCodeBadge.textContent = `${status} OK`;
    statusCodeBadge.className = 'status-badge status-ok';
  } else {
    statusCodeBadge.textContent = `${status} ERROR`;
    statusCodeBadge.className = 'status-badge status-error';
  }
}

function mostrarError(mensaje) {
  loader.style.display = 'none';
  digimonContainer.style.display = 'none';
  errorMessage.style.display = 'block';
  errorDetails.textContent = mensaje;
}

/**
 * ====================================================================
 * ASIGNACIÓN DE EVENTOS
 * ====================================================================
 */
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) getDigimonDetails(query);
});

randomBtn.addEventListener('click', getRandomDigimon);

quickButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.getAttribute('data-name');
    searchInput.value = name;
    clearBtn.style.display = 'block';
    getDigimonDetails(name);
  });
});

searchInput.addEventListener('input', () => {
  clearBtn.style.display = searchInput.value ? 'block' : 'none';
});

clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearBtn.style.display = 'none';
  searchInput.focus();
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  searchInput.value = 'Agumon';
  clearBtn.style.display = 'block';
  getDigimonDetails('Agumon');
  loadInitialGallery();
});
