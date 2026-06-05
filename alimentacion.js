/**
 * alimentacion.js
 * Módulo de Alimentación y Convivencia
 *
 * Compatible con residentes.json v2.0
 * Las comidas se identifican siempre en minúscula: desayuno, comida, merienda, cena
 */

// ─── Reglas de menú por tipo de dieta ────────────────────────────────────────

const DIET_RULES = {
    "TURMIX": {
        "desayuno": "Gachas",
        "comida":   "Puré",
        "merienda": "Compota",
        "cena":     "Puré"
    },
    "BLANDA": {
        "desayuno": "Café con tostadas",
        "comida":   "Menú normal",
        "merienda": "Café con galletas",
        "cena":     "Menú normal"
    },

};

/**
 * Obtiene el menú de un residente para una comida concreta.
 * @param {string} dieta   - "TURMIX" or "BLANDA"
 * @param {string} comida  - "desayuno" | "comida" | "merienda" | "cena"
 * @returns {string} Descripción del plato
 */
function getMenu(dieta, comida) {
    const regla = DIET_RULES[dieta] || DIET_RULES["BLANDA"];
    return comida ? (regla[comida] || '—') : regla;
}

// ─── Acceso a disponibilidad de comidas ──────────────────────────────────────

/**
 * Devuelve el objeto de disponibilidad de comidas de un residente.
 * Si el campo no existe o está mal formado, devuelve todas las comidas activas.
 *
 * El campo disponibilidad_comidas en residentes.json tiene la forma:
 *   { desayuno: true, comida: false, merienda: true, cena: true }
 *
 * @param {object} residente - Objeto residente normalizado
 * @returns {{ desayuno: boolean, comida: boolean, merienda: boolean, cena: boolean }}
 */
function getDisponibilidad(residente) {
    const fallback = { desayuno: true, comida: true, merienda: true, cena: true };
    const disp = residente.disponibilidad_comidas;
    if (!disp || typeof disp !== 'object') return fallback;
    return {
        desayuno: disp.desayuno === true,
        comida:   disp.comida   === true,
        merienda: disp.merienda === true,
        cena:     disp.cena     === true
    };
}

/**
 * Comprueba si un residente recibe una comida concreta en su área.
 * @param {object} residente - Objeto residente normalizado
 * @param {string} comida    - "desayuno" | "comida" | "merienda" | "cena"
 * @returns {boolean}
 */
function recibeComida(residente, comida) {
    return getDisponibilidad(residente)[comida] === true;
}
