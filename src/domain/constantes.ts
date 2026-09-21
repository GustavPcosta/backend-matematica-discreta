import { Raridade } from './tipos';

/** Indução: XP(1) = 100 e XP(n+1) = XP(n) + 50·n */
export const XP_INICIAL = 100;
export const INCREMENTO_XP = 50;

export const LIMITE_ITENS = 20;
export const MAX_EVENTOS = 5;

/** Teto de tempo processado por chamada de tick (ganho offline máximo: 8h) */
export const MAX_SEGUNDOS_POR_TICK = 8 * 60 * 60;

export const ID_ATIVIDADE_EXPLORAR = 'explorar';

/**
 * Probabilidade: pesos do sorteio da atividade "Explorar" (70% / 25% / 5%).
 * Comum = nada relevante acontece; raro/lendário geram evento no log.
 */
export const PESOS_RARIDADE_EXPLORAR: ReadonlyArray<{ raridade: Raridade; peso: number }> = [
  { raridade: Raridade.COMUM, peso: 70 },
  { raridade: Raridade.RARO, peso: 25 },
  { raridade: Raridade.LENDARIO, peso: 5 },
];

/** Itens extras concedidos quando o sorteio de Explorar sai raro/lendário */
export const BONUS_ITENS: Partial<Record<Raridade, number>> = {
  [Raridade.RARO]: 1,
  [Raridade.LENDARIO]: 3,
};
