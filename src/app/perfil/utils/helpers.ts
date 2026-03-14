/**
 * Limpia una URL o un handle de red social para mostrar solo el nombre de usuario.
 * Elimina protocolos (http/https), dominios y símbolos como '@'.
 */

//Ruta: src/app/perfil/utils/helpers.ts

export const limpiarUsername = (valor: string): string => {
  if (!valor) return ''
  
  return valor
    .trim()
    .replace(/^(https?:\/\/)?(www\.)?(twitter\.com|instagram\.com|patreon\.com|tiktok\.com|youtube\.com)\//, '')
    .replace(/\/$/, '') // Elimina la barra final si existe
    .replace(/^@/, '')  // Elimina el @ inicial si el usuario lo escribió
}

/**
 * Puedes agregar aquí otras funciones de utilidad que necesites en el futuro,
 * como formateadores de fechas o validadores de texto.
 */