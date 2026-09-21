import { EQUIPAMENTOS } from '../domain/catalogo';
import { Classe, TipoEquipamento } from '../domain/tipos';
import { equipamentosCompativeis } from './relacoes';

/** Princípio multiplicativo: |Classes| × |Armas| × |Armaduras| */
export function contarCombinacoes(classes: number, armas: number, armaduras: number): number {
  return classes * armas * armaduras;
}

export interface ResumoCombinatoria {
  classes: number;
  armas: number;
  armaduras: number;
  /** classes × armas × armaduras */
  totalBruto: number;
  /** Só combinações em que arma e armadura são compatíveis com a classe */
  totalCompativel: number;
}

export function resumoCombinatoria(): ResumoCombinatoria {
  const classes = Object.values(Classe);
  const armas = EQUIPAMENTOS.filter((e) => e.tipo === TipoEquipamento.ARMA).length;
  const armaduras = EQUIPAMENTOS.filter((e) => e.tipo === TipoEquipamento.ARMADURA).length;

  const totalCompativel = classes.reduce((soma, classe) => {
    const compat = equipamentosCompativeis(classe);
    const a = compat.filter((e) => e.tipo === TipoEquipamento.ARMA).length;
    const r = compat.filter((e) => e.tipo === TipoEquipamento.ARMADURA).length;
    return soma + a * r;
  }, 0);

  return {
    classes: classes.length,
    armas,
    armaduras,
    totalBruto: contarCombinacoes(classes.length, armas, armaduras),
    totalCompativel,
  };
}
