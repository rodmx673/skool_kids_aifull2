/**
 * @fileOverview Módulo de utilidad para estandarizar formatos de datos transaccionales.
 * Este módulo centraliza la creación de objetos de datos para garantizar una estructura
 * consistente y con claves de trazabilidad antes de su almacenamiento.
 */

/**
 * Genera un ID único basado en un prefijo y el timestamp actual.
 * @param {string} prefix - Un prefijo para identificar el tipo de registro.
 * @returns {string} Un ID único.
 */
const generateUniqueId = (prefix) => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

/**
 * Formatea un registro de asistencia de entrada/salida.
 * @param {string} alumnoId - El ID del alumno.
 * @param {'ENTRADA' | 'SALIDA'} tipoMovimiento - El tipo de movimiento que se está registrando.
 * @returns {object} Un objeto de registro de asistencia estandarizado.
 */
export const formatAttendanceRecord = (alumnoId, tipoMovimiento) => {
  if (!alumnoId || !tipoMovimiento) {
    throw new Error("El ID del alumno y el tipo de movimiento son obligatorios.");
  }
  
  if (tipoMovimiento !== 'ENTRADA' && tipoMovimiento !== 'SALIDA') {
    throw new Error("El tipo de movimiento debe ser 'ENTRADA' o 'SALIDA'.");
  }

  return {
    registro_id: generateUniqueId('att'),
    alumno_id: alumnoId,
    fecha_hora: new Date().toISOString(),
    tipo_movimiento: tipoMovimiento,
  };
};

/**
 * Formatea un registro de entrega de tarea por parte de un alumno.
 * @param {string} tareaId - El ID de la tarea que se está entregando.
 * @param {string} alumnoId - El ID del alumno que realiza la entrega.
 * @param {string} archivoUrl - La URL del archivo adjunto.
 * @param {string} [notas] - Notas adicionales del alumno (actualmente no se incluye en el objeto final según requerimiento).
 * @returns {object} Un objeto de entrega de tarea estandarizado.
 */
export const formatStudentSubmission = (tareaId, alumnoId, archivoUrl, notas) => {
  if (!tareaId || !alumnoId || !archivoUrl) {
    throw new Error("El ID de la tarea, el ID del alumno y la URL del archivo son obligatorios.");
  }

  return {
    submission_id: generateUniqueId('sub'),
    tarea_id: tareaId,
    alumno_id: alumnoId,
    url_archivo_entrega: archivoUrl,
    fecha_entrega: new Date().toISOString(),
  };
};

/**
 * Formatea una calificación asignada por un docente a una entrega.
 * @param {string} submissionId - El ID de la entrega que se está calificando.
 * @param {string} docenteId - El ID del docente que califica.
 * @param {number} valorNota - El valor numérico de la calificación.
 * @param {string} [comentarios] - Comentarios adicionales del docente (actualmente no se incluye en el objeto final según requerimiento).
 * @returns {object} Un objeto de calificación estandarizado.
 */
export const formatGrade = (submissionId, docenteId, valorNota, comentarios) => {
  if (!submissionId || !docenteId || typeof valorNota !== 'number') {
    throw new Error("El ID de la entrega, el ID del docente y un valor de nota numérico son obligatorios.");
  }
  
  return {
    calificacion_id: generateUniqueId('grade'),
    submission_id: submissionId,
    docente_id: docenteId,
    valor_nota: valorNota,
    fecha_asignacion: new Date().toISOString(),
  };
};

// Exportar todo para facilitar la importación.
export default {
  formatAttendanceRecord,
  formatStudentSubmission,
  formatGrade,
};
