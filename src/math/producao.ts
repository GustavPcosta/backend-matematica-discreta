/** Funções: produção = taxa × tempo decorrido. Pura. */
export function calcularProducao(taxaPorSegundo: number, segundos: number): number {
  return taxaPorSegundo * segundos;
}
