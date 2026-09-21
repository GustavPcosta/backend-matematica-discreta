import { PESOS_RARIDADE_EXPLORAR } from '../domain/constantes';
import { Raridade } from '../domain/tipos';

type Pesos = ReadonlyArray<{ raridade: Raridade; peso: number }>;

/**
 * Probabilidade: converte um número em [0, 1) em uma raridade segundo os pesos
 * (70% / 25% / 5%). Pura: mesma entrada, mesma saída. É o ÚNICO ponto onde a
 * aleatoriedade do jogo vira resultado; quem sorteia o `roll` é o serviço.
 */
export function sortearRaridade(roll: number, pesos: Pesos = PESOS_RARIDADE_EXPLORAR): Raridade {
  if (!(roll >= 0 && roll < 1)) {
    throw new RangeError('roll deve estar em [0, 1)');
  }
  const total = pesos.reduce((s, p) => s + p.peso, 0);
  const alvo = roll * total;
  let acumulado = 0;
  for (const { raridade, peso } of pesos) {
    acumulado += peso;
    if (alvo < acumulado) return raridade;
  }
  return pesos[pesos.length - 1].raridade;
}

/** P(raridade) = peso / soma dos pesos */
export function probabilidadeDe(raridade: Raridade, pesos: Pesos = PESOS_RARIDADE_EXPLORAR): number {
  const total = pesos.reduce((s, p) => s + p.peso, 0);
  const item = pesos.find((p) => p.raridade === raridade);
  return item ? item.peso / total : 0;
}

/** P(pelo menos 1 evento raro ou lendário em n sorteios) = 1 − P(comum)^n */
export function probabilidadeAoMenosUmEvento(n: number, pesos: Pesos = PESOS_RARIDADE_EXPLORAR): number {
  return 1 - Math.pow(probabilidadeDe(Raridade.COMUM, pesos), n);
}
