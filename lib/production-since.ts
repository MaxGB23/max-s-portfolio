/**
 * Fechas de arranque en produccion de los sistemas publicados.
 *
 * Por que existen aqui y no en cada ficha: el dato lo publican dos consumidores
 * (la ficha del proyecto y el badge del README) y una copia por lado se
 * desincroniza en cuanto alguien corrige una. `lib` no importa `data` en tiempo
 * de ejecucion, asi que la constante vive de este lado y las dos la leen.
 *
 * Solo entran sistemas que siguen en produccion: un periodo cerrado nunca lleva
 * fecha, porque una cifra que crece cada mes afirmaria algo falso.
 */

/**
 * Primer despliegue real del sistema que hoy es CAF (22 nov 2025), en el repositorio
 * que luego migro a `centro-caf`.
 */
export const CAF_PRODUCTION_SINCE = "2025-11-22";
