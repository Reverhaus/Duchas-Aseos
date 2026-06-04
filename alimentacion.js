/**
 * alimentacion.js
 * Módulo de Alimentación y Convivencia
 */

const DIET_RULES = {
    "TURMIX": {
        "Desayuno": "Gachas",
        "Comida": "Puré",
        "Merienda": "Compota",
        "Cena": "Puré"
    },
    "BLANDA": {
        "Desayuno": "Café con tostadas",
        "Comida": "Menú normal",
        "Merienda": "Café con galletas",
        "Cena": "Menú normal"
    },
    "NORMAL": {
        "Desayuno": "Normal",
        "Comida": "Normal",
        "Merienda": "Normal",
        "Cena": "Normal"
    }
};

/**
 * Obtiene el menú basado en la dieta del residente
 * @param {string} dieta - "TURMIX", "BLANDA" o "NORMAL"
 * @returns {object} Objeto con las 4 comidas
 */
function getMenu(dieta) {
    if (!dieta || !DIET_RULES[dieta]) {
        return DIET_RULES["NORMAL"];
    }
    return DIET_RULES[dieta];
}

/**
 * Parsea el string de disponibilidad a objeto de booleanos
 * @param {string} dispStr - Ej: "1*1*0*1"
 * @returns {object} { desayuno, comida, merienda, cena }
 */
function parseDisponibilidad(dispStr) {
    const defaultDisp = { desayuno: true, comida: true, merienda: true, cena: true };
    if (!dispStr) return defaultDisp;

    const regex = /^[01]\*[01]\*[01]\*[01]$/;
    if (!regex.test(dispStr)) return defaultDisp;

    const parts = dispStr.split('*');
    return {
        desayuno: parts[0] === '1',
        comida: parts[1] === '1',
        merienda: parts[2] === '1',
        cena: parts[3] === '1'
    };
}

/**
 * Codifica el objeto de booleanos al string de disponibilidad
 * @param {object} dispObj - { desayuno, comida, merienda, cena }
 * @returns {string} Ej: "1*1*0*1"
 */
function encodeDisponibilidad(dispObj) {
    const p1 = dispObj.desayuno ? '1' : '0';
    const p2 = dispObj.comida ? '1' : '0';
    const p3 = dispObj.merienda ? '1' : '0';
    const p4 = dispObj.cena ? '1' : '0';
    return `${p1}*${p2}*${p3}*${p4}`;
}
