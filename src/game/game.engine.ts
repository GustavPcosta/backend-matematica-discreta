import { randomUUID } from 'crypto';
import { criarAtividadesIniciais } from '../domain/catalogo';
import {
  BONUS_ITENS,
  ID_ATIVIDADE_EXPLORAR,
  LIMITE_ITENS,
  MAX_EVENTOS,
} from '../domain/constantes';
import {
  Classe,
  EstadoJogo,
  Evento,
  Raridade,
  ResultadoTick,
  TipoEvento,
  TipoRecurso,
} from '../domain/tipos';
import { calcularAtributos, calcularProducao, sortearRaridade, xpNecessario } from '../math';

/**
 * "Motor" do jogo: recebe um estado e devolve o novo estado.
 * Não usa relógio nem aleatoriedade próprios: o tempo (segundos) e o sorteio
 * (`sortear`, devolve número em [0,1)) entram como parâmetro. Isso deixa tudo testável.
 */

export function criarEstadoInicial(
  id: string,
  classe: Classe,
  nome: string,
  agora: number,
): EstadoJogo {
  const attrs = calcularAtributos(classe, 1, []);
  return {
    id,
    criadoEm: new Date(agora).toISOString(),
    ultimoTick: agora,
    personagem: {
      nome,
      classe,
      nivel: 1,
      xpAtual: 0,
      xpProximoNivel: xpNecessario(1),
      vidaAtual: attrs.vidaMaxima,
      vidaMaxima: attrs.vidaMaxima,
      ataque: attrs.ataque,
      defesa: attrs.defesa,
      equipamentos: [],
      atividadeAtualId: null,
    },
    atividades: criarAtividadesIniciais(),
    recursos: { ouro: 0, xp: 0, itens: 0, limiteItens: LIMITE_ITENS },
    eventos: [],
  };
}

/** Adiciona um evento ao log (mais recente primeiro, no máximo 5). Muta `estado`. */
export function registrarEvento(
  estado: EstadoJogo,
  mensagem: string,
  tipo: TipoEvento,
  momentoMs: number,
  novos?: Evento[],
): void {
  const evento: Evento = {
    id: randomUUID(),
    momento: new Date(momentoMs).toISOString(),
    mensagem,
    tipo,
  };
  estado.eventos = [evento, ...estado.eventos].slice(0, MAX_EVENTOS);
  novos?.push(evento);
}

/** Recalcula ataque/defesa/vida máxima a partir de classe, nível e equipamentos. Muta `estado`. */
export function recalcularAtributos(estado: EstadoJogo): void {
  const p = estado.personagem;
  const attrs = calcularAtributos(p.classe, p.nivel, p.equipamentos);
  p.vidaMaxima = attrs.vidaMaxima;
  p.ataque = attrs.ataque;
  p.defesa = attrs.defesa;
  p.vidaAtual = Math.min(p.vidaAtual, p.vidaMaxima);
}

/**
 * Avança `segundos` de jogo com a atividade ativa (um "tick" por segundo).
 * Se não há atividade ativa, nada muda.
 */
export function avancarTempo(
  original: EstadoJogo,
  segundos: number,
  sortear: () => number,
): ResultadoTick {
  const estado = structuredClone(original);
  const novosEventos: Evento[] = [];
  const ativa = estado.atividades.find((a) => a.ativa);
  if (!ativa || segundos <= 0) return { estado, novosEventos };

  for (let i = 1; i <= segundos; i++) {
    const momento = original.ultimoTick + i * 1000;

    // 1) Produção do segundo (função pura)
    const producao = calcularProducao(ativa.taxaPorSegundo, 1);
    aplicarProducao(estado, ativa.recurso, producao);

    // 2) Subida de nível (indução)
    if (ativa.recurso === TipoRecurso.XP) {
      processarNivel(estado, momento, novosEventos);
    }

    // 3) Evento de probabilidade ao explorar
    if (ativa.id === ID_ATIVIDADE_EXPLORAR) {
      sortearEventoExplorar(estado, momento, sortear, novosEventos);
    }
  }
  return { estado, novosEventos };
}

function aplicarProducao(estado: EstadoJogo, recurso: TipoRecurso, quantidade: number): void {
  const r = estado.recursos;
  switch (recurso) {
    case TipoRecurso.OURO:
      r.ouro += quantidade;
      break;
    case TipoRecurso.XP:
      r.xp += quantidade;
      estado.personagem.xpAtual += quantidade;
      break;
    case TipoRecurso.ITEM:
      r.itens = Math.min(r.limiteItens, r.itens + quantidade);
      break;
  }
}

function processarNivel(estado: EstadoJogo, momento: number, novos: Evento[]): void {
  const p = estado.personagem;
  while (p.xpAtual >= p.xpProximoNivel) {
    p.xpAtual -= p.xpProximoNivel;
    p.nivel += 1;
    p.xpProximoNivel = xpNecessario(p.nivel);
    recalcularAtributos(estado);
    p.vidaAtual = p.vidaMaxima;
    registrarEvento(estado, `Subiu para o nível ${p.nivel}!`, TipoEvento.INFORMATIVO, momento, novos);

    for (const a of estado.atividades) {
      if (!a.desbloqueada && p.nivel >= a.nivelDesbloqueio) {
        a.desbloqueada = true;
        registrarEvento(estado, `Atividade "${a.nome}" desbloqueada`, TipoEvento.INFORMATIVO, momento, novos);
      }
    }
  }
}

function sortearEventoExplorar(
  estado: EstadoJogo,
  momento: number,
  sortear: () => number,
  novos: Evento[],
): void {
  const raridade = sortearRaridade(sortear());
  if (raridade === Raridade.COMUM) return; // nada relevante aconteceu

  const r = estado.recursos;
  r.itens = Math.min(r.limiteItens, r.itens + (BONUS_ITENS[raridade] ?? 0));

  if (raridade === Raridade.LENDARIO) {
    registrarEvento(estado, 'Encontrou item lendário!', TipoEvento.LENDARIO, momento, novos);
  } else {
    registrarEvento(estado, 'Encontrou item raro', TipoEvento.RARO, momento, novos);
  }
}
