import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EQUIPAMENTOS } from '../domain/catalogo';
import { MAX_SEGUNDOS_POR_TICK } from '../domain/constantes';
import {
  EstadoJogo,
  Evento,
  SecaoCentralMatematica,
  TipoEvento,
} from '../domain/tipos';
import { ehCompativel, montarCentralMatematica } from '../math';
import { CriarJogoDto, RespostaTick } from './dto';
import {
  avancarTempo,
  criarEstadoInicial,
  recalcularAtributos,
  registrarEvento,
} from './game.engine';
import { GameRepository } from './game.repository';
import { Clock, RandomService } from './runtime';

@Injectable()
export class GameService {
  constructor(
    private readonly repo: GameRepository,
    private readonly clock: Clock,
    private readonly random: RandomService,
  ) {}

  criar(dto: CriarJogoDto): EstadoJogo {
    const nome = dto.nome?.trim() || 'Herói';
    const estado = criarEstadoInicial(randomUUID(), dto.classe, nome, this.clock.now());
    this.repo.save(estado);
    return estado;
  }

  obter(id: string): EstadoJogo {
    return this.buscar(id);
  }

  remover(id: string): void {
    this.buscar(id);
    this.repo.delete(id);
  }

  /**
   * Game loop autoritativo: processa o tempo real decorrido desde o último tick.
   * O front pode chamar a cada 1s; chamadas duplicadas/simultâneas NÃO geram
   * produção extra, porque o tempo processado é controlado pelo servidor.
   */
  tick(id: string): RespostaTick {
    const { estado, novosEventos, segundos } = this.liquidar(this.buscar(id));
    this.repo.save(estado);
    return { estado, segundosProcessados: segundos, novosEventos };
  }

  iniciarAtividade(id: string, atividadeId: string): EstadoJogo {
    const { estado } = this.liquidar(this.buscar(id));
    const atividade = estado.atividades.find((a) => a.id === atividadeId);
    if (!atividade) throw new NotFoundException(`Atividade "${atividadeId}" não existe`);
    if (!atividade.desbloqueada) {
      throw new ConflictException(
        `Atividade "${atividade.nome}" bloqueada: requer nível ${atividade.nivelDesbloqueio}`,
      );
    }

    estado.atividades.forEach((a) => (a.ativa = a.id === atividadeId));
    estado.personagem.atividadeAtualId = atividadeId;
    registrarEvento(estado, `Iniciou a atividade "${atividade.nome}"`, TipoEvento.INFORMATIVO, this.clock.now());

    this.repo.save(estado);
    return estado;
  }

  pararAtividade(id: string): EstadoJogo {
    const { estado } = this.liquidar(this.buscar(id));
    const atual = estado.atividades.find((a) => a.ativa);
    if (!atual) throw new ConflictException('Nenhuma atividade em andamento');

    atual.ativa = false;
    estado.personagem.atividadeAtualId = null;
    registrarEvento(estado, `Parou a atividade "${atual.nome}"`, TipoEvento.INFORMATIVO, this.clock.now());

    this.repo.save(estado);
    return estado;
  }

  equipar(id: string, equipamentoId: string): EstadoJogo {
    const estado = this.buscar(id);
    const equipamento = EQUIPAMENTOS.find((e) => e.id === equipamentoId);
    if (!equipamento) throw new NotFoundException(`Equipamento "${equipamentoId}" não existe`);
    if (!ehCompativel(estado.personagem.classe, equipamentoId)) {
      throw new BadRequestException(
        `${equipamento.nome} não é compatível com a classe ${estado.personagem.classe}`,
      );
    }

    // Um equipamento por tipo (arma / armadura): substitui o anterior do mesmo tipo
    estado.personagem.equipamentos = [
      ...estado.personagem.equipamentos.filter((e) => e.tipo !== equipamento.tipo),
      { ...equipamento },
    ];
    recalcularAtributos(estado);
    registrarEvento(estado, `Equipou ${equipamento.nome}`, TipoEvento.INFORMATIVO, this.clock.now());

    this.repo.save(estado);
    return estado;
  }

  eventos(id: string): Evento[] {
    return this.buscar(id).eventos;
  }

  centralMatematica(id: string): SecaoCentralMatematica[] {
    return montarCentralMatematica(this.buscar(id));
  }

  // ---------------------------------------------------------------------------

  private buscar(id: string): EstadoJogo {
    const estado = this.repo.find(id);
    if (!estado) throw new NotFoundException(`Jogo "${id}" não encontrado`);
    return estado;
  }

  /** Aplica ao estado o tempo decorrido desde `ultimoTick` (com teto de 8h). */
  private liquidar(estado: EstadoJogo) {
    const agora = this.clock.now();
    const decorridos = Math.max(0, Math.floor((agora - estado.ultimoTick) / 1000));
    const segundos = Math.min(decorridos, MAX_SEGUNDOS_POR_TICK);

    const resultado = avancarTempo(estado, segundos, () => this.random.next());
    resultado.estado.ultimoTick =
      decorridos > MAX_SEGUNDOS_POR_TICK ? agora : estado.ultimoTick + segundos * 1000;

    return { ...resultado, segundos };
  }
}
