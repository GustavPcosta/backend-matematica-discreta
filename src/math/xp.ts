import { INCREMENTO_XP, XP_INICIAL } from '../domain/constantes';

function validarNivel(nivel: number): void {
  if (!Number.isInteger(nivel) || nivel < 1) {
    throw new RangeError('O nível deve ser um inteiro maior ou igual a 1');
  }
}

/**
 * Indução (definição recursiva):
 *   XP(1) = 100
 *   XP(n+1) = XP(n) + 50·n
 * Implementada em laço para não estourar a pilha em níveis altos.
 */
export function xpNecessarioRecursivo(nivel: number): number {
  validarNivel(nivel);
  let xp = XP_INICIAL;
  for (let k = 1; k < nivel; k++) {
    xp += INCREMENTO_XP * k;
  }
  return xp;
}

/**
 * Forma fechada demonstrável por indução:
 *   XP(n) = 100 + 25·n·(n − 1)
 */
export function xpNecessario(nivel: number): number {
  validarNivel(nivel);
  return XP_INICIAL + (INCREMENTO_XP / 2) * nivel * (nivel - 1);
}
