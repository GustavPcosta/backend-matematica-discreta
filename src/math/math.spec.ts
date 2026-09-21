import { Classe, Raridade, TipoEquipamento } from '../domain/tipos';
import { EQUIPAMENTOS } from '../domain/catalogo';
import {
  calcularAtributos,
  calcularProducao,
  contarCombinacoes,
  ehCompativel,
  equipamentosCompativeis,
  intersecao,
  probabilidadeAoMenosUmEvento,
  probabilidadeDe,
  resumoCombinatoria,
  sortearRaridade,
  uniao,
  xpNecessario,
  xpNecessarioRecursivo,
} from './index';

describe('Funções', () => {
  it('produção = taxa × tempo', () => {
    expect(calcularProducao(3, 10)).toBe(30);
    expect(calcularProducao(0, 10)).toBe(0);
  });
});

describe('Indução (XP)', () => {
  it('valores iniciais', () => {
    expect([1, 2, 3, 4].map(xpNecessario)).toEqual([100, 150, 250, 400]);
  });
  it('definição recursiva e forma fechada coincidem para n = 1..200', () => {
    for (let n = 1; n <= 200; n++) {
      expect(xpNecessarioRecursivo(n)).toBe(xpNecessario(n));
    }
  });
  it('rejeita nível inválido', () => {
    expect(() => xpNecessario(0)).toThrow(RangeError);
    expect(() => xpNecessario(1.5)).toThrow(RangeError);
  });
});

describe('Conjuntos', () => {
  it('união e interseção sem repetição', () => {
    expect(uniao(['a', 'b'], ['b', 'c'])).toEqual(['a', 'b', 'c']);
    expect(intersecao(['a', 'b'], ['b', 'c'])).toEqual(['b']);
  });
});

describe('Relações', () => {
  it('filtra equipamentos pela classe', () => {
    const ids = equipamentosCompativeis(Classe.MAGO).map((e) => e.id);
    expect(ids).toEqual(['cajado-carvalho', 'cajado-arcano', 'manto-aprendiz', 'manto-arcano']);
    expect(ehCompativel(Classe.MAGO, 'espada-ferro')).toBe(false);
    expect(ehCompativel(Classe.ARQUEIRO, 'armadura-couro')).toBe(true);
  });
});

describe('Combinatória', () => {
  it('princípio multiplicativo', () => {
    expect(contarCombinacoes(3, 6, 4)).toBe(72);
  });
  it('resumo do catálogo', () => {
    const r = resumoCombinatoria();
    expect(r.classes).toBe(3);
    expect(r.armas).toBe(EQUIPAMENTOS.filter((e) => e.tipo === TipoEquipamento.ARMA).length);
    expect(r.totalBruto).toBe(r.classes * r.armas * r.armaduras);
    expect(r.totalCompativel).toBe(10); // 2×2 + 2×2 + 2×1
  });
});

describe('Probabilidade', () => {
  it('sorteio determinístico pelos pesos 70/25/5', () => {
    expect(sortearRaridade(0)).toBe(Raridade.COMUM);
    expect(sortearRaridade(0.6999)).toBe(Raridade.COMUM);
    expect(sortearRaridade(0.7)).toBe(Raridade.RARO);
    expect(sortearRaridade(0.9499)).toBe(Raridade.RARO);
    expect(sortearRaridade(0.95)).toBe(Raridade.LENDARIO);
    expect(sortearRaridade(0.9999)).toBe(Raridade.LENDARIO);
  });
  it('rejeita roll fora de [0,1)', () => {
    expect(() => sortearRaridade(1)).toThrow(RangeError);
    expect(() => sortearRaridade(-0.1)).toThrow(RangeError);
  });
  it('probabilidades', () => {
    expect(probabilidadeDe(Raridade.COMUM)).toBeCloseTo(0.7);
    expect(probabilidadeDe(Raridade.EPICO)).toBe(0);
    expect(probabilidadeAoMenosUmEvento(1)).toBeCloseTo(0.3);
    expect(probabilidadeAoMenosUmEvento(10)).toBeCloseTo(1 - Math.pow(0.7, 10));
  });
  it('distribuição empírica ≈ pesos (roll uniforme)', () => {
    const N = 100000;
    const cont: Record<string, number> = {};
    for (let i = 0; i < N; i++) {
      const r = sortearRaridade(i / N);
      cont[r] = (cont[r] ?? 0) + 1;
    }
    expect(cont[Raridade.COMUM] / N).toBeCloseTo(0.7, 2);
    expect(cont[Raridade.RARO] / N).toBeCloseTo(0.25, 2);
    expect(cont[Raridade.LENDARIO] / N).toBeCloseTo(0.05, 2);
  });
});

describe('Atributos', () => {
  it('base + crescimento + equipamentos', () => {
    const espada = EQUIPAMENTOS.find((e) => e.id === 'espada-ferro')!;
    expect(calcularAtributos(Classe.GUERREIRO, 1, [])).toEqual({ vidaMaxima: 120, ataque: 10, defesa: 8 });
    expect(calcularAtributos(Classe.GUERREIRO, 3, [espada])).toEqual({ vidaMaxima: 144, ataque: 19, defesa: 12 });
  });
});
