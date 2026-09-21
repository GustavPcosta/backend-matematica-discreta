import { COMPATIBILIDADE, EQUIPAMENTOS } from '../domain/catalogo';
import { Classe, Equipamento } from '../domain/tipos';

type Relacao = ReadonlyArray<readonly [Classe, string]>;

/** Relações: (classe, equipamento) ∈ R ? */
export function ehCompativel(
  classe: Classe,
  equipamentoId: string,
  relacao: Relacao = COMPATIBILIDADE,
): boolean {
  return relacao.some(([c, e]) => c === classe && e === equipamentoId);
}

/** Imagem de R para a classe: equipamentos { e | (classe, e) ∈ R } */
export function equipamentosCompativeis(
  classe: Classe,
  catalogo: ReadonlyArray<Equipamento> = EQUIPAMENTOS,
  relacao: Relacao = COMPATIBILIDADE,
): Equipamento[] {
  return catalogo.filter((eq) => ehCompativel(classe, eq.id, relacao));
}
