import { PESOS_RARIDADE_EXPLORAR } from '../domain/constantes';
import { Classe, EstadoJogo, SecaoCentralMatematica } from '../domain/tipos';
import { resumoCombinatoria } from './combinatoria';
import { atributosDaClasse, intersecao, uniao } from './conjuntos';
import { calcularProducao } from './producao';
import { probabilidadeAoMenosUmEvento } from './probabilidade';
import { equipamentosCompativeis } from './relacoes';
import { xpNecessario, xpNecessarioRecursivo } from './xp';

/** Monta as 6 seções da Central Matemática: fórmula + resultado ao vivo. */
export function montarCentralMatematica(estado: EstadoJogo): SecaoCentralMatematica[] {
  const { personagem } = estado;
  const ativa = estado.atividades.find((a) => a.ativa) ?? null;
  const taxa = ativa?.taxaPorSegundo ?? 0;
  const combinatoria = resumoCombinatoria();
  const atributosClasse = atributosDaClasse(personagem.classe);
  const outras = Object.values(Classe).filter((c) => c !== personagem.classe);
  const TICKS_EXEMPLO = 10;

  return [
    {
      id: 'funcoes',
      titulo: 'Funções',
      formula: 'produção(t) = taxa × t',
      entrada: { atividade: ativa?.nome ?? null, taxaPorSegundo: taxa, segundos: 1 },
      resultado: calcularProducao(taxa, 1),
    },
    {
      id: 'inducao',
      titulo: 'Indução',
      formula: 'XP(1) = 100; XP(n+1) = XP(n) + 50·n  ⇒  XP(n) = 100 + 25·n·(n − 1)',
      entrada: { nivel: personagem.nivel },
      resultado: {
        recursiva: xpNecessarioRecursivo(personagem.nivel),
        formaFechada: xpNecessario(personagem.nivel),
        xpProximoNivel: personagem.xpProximoNivel,
      },
    },
    {
      id: 'conjuntos',
      titulo: 'Conjuntos',
      formula: 'Atributos(classe) = { a | a pertence à classe }',
      entrada: { classe: personagem.classe },
      resultado: {
        atributos: atributosClasse,
        uniaoComOutrasClasses: outras.reduce(
          (acc, c) => uniao(acc, atributosDaClasse(c)),
          atributosClasse,
        ),
        intersecaoComOutrasClasses: outras.reduce(
          (acc, c) => intersecao(acc, atributosDaClasse(c)),
          atributosClasse,
        ),
      },
    },
    {
      id: 'relacoes',
      titulo: 'Relações',
      formula: 'R ⊆ Classe × Equipamento;  compatíveis(c) = { e | (c, e) ∈ R }',
      entrada: { classe: personagem.classe },
      resultado: equipamentosCompativeis(personagem.classe).map((e) => e.id),
    },
    {
      id: 'combinatoria',
      titulo: 'Combinatória',
      formula: '|Classes| × |Armas| × |Armaduras|',
      entrada: {
        classes: combinatoria.classes,
        armas: combinatoria.armas,
        armaduras: combinatoria.armaduras,
      },
      resultado: {
        totalBruto: combinatoria.totalBruto,
        totalCompativel: combinatoria.totalCompativel,
      },
    },
    {
      id: 'probabilidade',
      titulo: 'Probabilidade',
      formula: 'P(comum)=70%, P(raro)=25%, P(lendário)=5%;  P(≥1 raro/lendário em n) = 1 − 0,7ⁿ',
      entrada: {
        pesos: PESOS_RARIDADE_EXPLORAR.map((p) => ({ raridade: p.raridade, peso: p.peso })),
        n: TICKS_EXEMPLO,
      },
      resultado: probabilidadeAoMenosUmEvento(TICKS_EXEMPLO),
    },
  ];
}
