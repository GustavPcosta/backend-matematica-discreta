import {
  Atividade,
  Atributos,
  Classe,
  Equipamento,
  Raridade,
  TipoEquipamento,
  TipoRecurso,
} from './tipos';

export interface ConfigClasse {
  /** Conjuntos: atributos que pertencem à classe */
  atributos: string[];
  /** Atributos no nível 1 */
  base: Atributos;
  /** Ganho por nível acima de 1 */
  crescimento: Atributos;
}

export const CLASSES: Record<Classe, ConfigClasse> = {
  [Classe.GUERREIRO]: {
    atributos: ['forca', 'vitalidade', 'resistencia'],
    base: { vidaMaxima: 120, ataque: 10, defesa: 8 },
    crescimento: { vidaMaxima: 12, ataque: 2, defesa: 2 },
  },
  [Classe.MAGO]: {
    atributos: ['inteligencia', 'vitalidade', 'mana'],
    base: { vidaMaxima: 80, ataque: 14, defesa: 3 },
    crescimento: { vidaMaxima: 7, ataque: 3, defesa: 1 },
  },
  [Classe.ARQUEIRO]: {
    atributos: ['destreza', 'vitalidade', 'agilidade'],
    base: { vidaMaxima: 95, ataque: 12, defesa: 5 },
    crescimento: { vidaMaxima: 9, ataque: 2, defesa: 1 },
  },
};

export const EQUIPAMENTOS: ReadonlyArray<Equipamento> = [
  // Armas
  { id: 'espada-ferro', nome: 'Espada de Ferro', tipo: TipoEquipamento.ARMA, ataque: 5, defesa: 0, raridade: Raridade.COMUM },
  { id: 'espada-lendaria', nome: 'Espada Lendária', tipo: TipoEquipamento.ARMA, ataque: 15, defesa: 0, raridade: Raridade.LENDARIO },
  { id: 'cajado-carvalho', nome: 'Cajado de Carvalho', tipo: TipoEquipamento.ARMA, ataque: 4, defesa: 0, raridade: Raridade.COMUM },
  { id: 'cajado-arcano', nome: 'Cajado Arcano', tipo: TipoEquipamento.ARMA, ataque: 12, defesa: 0, raridade: Raridade.EPICO },
  { id: 'arco-cacador', nome: 'Arco de Caçador', tipo: TipoEquipamento.ARMA, ataque: 5, defesa: 0, raridade: Raridade.COMUM },
  { id: 'arco-elfico', nome: 'Arco Élfico', tipo: TipoEquipamento.ARMA, ataque: 10, defesa: 0, raridade: Raridade.RARO },
  // Armaduras
  { id: 'armadura-couro', nome: 'Armadura de Couro', tipo: TipoEquipamento.ARMADURA, ataque: 0, defesa: 3, raridade: Raridade.COMUM },
  { id: 'armadura-placas', nome: 'Armadura de Placas', tipo: TipoEquipamento.ARMADURA, ataque: 0, defesa: 8, raridade: Raridade.RARO },
  { id: 'manto-aprendiz', nome: 'Manto de Aprendiz', tipo: TipoEquipamento.ARMADURA, ataque: 0, defesa: 2, raridade: Raridade.COMUM },
  { id: 'manto-arcano', nome: 'Manto Arcano', tipo: TipoEquipamento.ARMADURA, ataque: 0, defesa: 5, raridade: Raridade.RARO },
];

/**
 * Relações: R ⊆ Classe × Equipamento. O par (c, e) ∈ R significa
 * "a classe c pode usar o equipamento e".
 */
export const COMPATIBILIDADE: ReadonlyArray<readonly [Classe, string]> = [
  [Classe.GUERREIRO, 'espada-ferro'],
  [Classe.GUERREIRO, 'espada-lendaria'],
  [Classe.GUERREIRO, 'armadura-couro'],
  [Classe.GUERREIRO, 'armadura-placas'],
  [Classe.MAGO, 'cajado-carvalho'],
  [Classe.MAGO, 'cajado-arcano'],
  [Classe.MAGO, 'manto-aprendiz'],
  [Classe.MAGO, 'manto-arcano'],
  [Classe.ARQUEIRO, 'arco-cacador'],
  [Classe.ARQUEIRO, 'arco-elfico'],
  [Classe.ARQUEIRO, 'armadura-couro'],
];

/** Cria atividades novas (cópias), já com `desbloqueada` calculado para o nível 1 */
export function criarAtividadesIniciais(): Atividade[] {
  const base: Omit<Atividade, 'ativa' | 'desbloqueada'>[] = [
    { id: 'cacar', nome: 'Caçar', recurso: TipoRecurso.OURO, taxaPorSegundo: 3, nivelDesbloqueio: 1 },
    { id: 'treinar', nome: 'Treinar', recurso: TipoRecurso.XP, taxaPorSegundo: 5, nivelDesbloqueio: 1 },
    { id: 'explorar', nome: 'Explorar', recurso: TipoRecurso.ITEM, taxaPorSegundo: 1, nivelDesbloqueio: 2 },
  ];
  return base.map((a) => ({ ...a, ativa: false, desbloqueada: a.nivelDesbloqueio <= 1 }));
}
