import { CLASSES } from '../domain/catalogo';
import { Classe } from '../domain/tipos';

/** Conjuntos: atributos pertencentes a uma classe */
export function atributosDaClasse(classe: Classe): string[] {
  return [...CLASSES[classe].atributos];
}

export function uniao<T>(a: readonly T[], b: readonly T[]): T[] {
  return [...new Set([...a, ...b])];
}

export function intersecao<T>(a: readonly T[], b: readonly T[]): T[] {
  const conjuntoB = new Set(b);
  return [...new Set(a)].filter((x) => conjuntoB.has(x));
}
