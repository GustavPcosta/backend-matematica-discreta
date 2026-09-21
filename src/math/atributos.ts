import { CLASSES } from '../domain/catalogo';
import { Atributos, Classe, Equipamento } from '../domain/tipos';

/** Atributos = base da classe + crescimento × (nível − 1) + bônus dos equipamentos */
export function calcularAtributos(
  classe: Classe,
  nivel: number,
  equipamentos: readonly Equipamento[],
): Atributos {
  const { base, crescimento } = CLASSES[classe];
  const niveis = nivel - 1;
  return {
    vidaMaxima: base.vidaMaxima + crescimento.vidaMaxima * niveis,
    ataque: base.ataque + crescimento.ataque * niveis + equipamentos.reduce((s, e) => s + e.ataque, 0),
    defesa: base.defesa + crescimento.defesa * niveis + equipamentos.reduce((s, e) => s + e.defesa, 0),
  };
}
