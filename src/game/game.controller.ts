import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { EstadoJogo, Evento, SecaoCentralMatematica } from '../domain/tipos';
import { CriarJogoDto, EquiparDto, RespostaTick } from './dto';
import { GameService } from './game.service';

@Controller('games')
export class GameController {
  constructor(private readonly game: GameService) {}

  /** Criação de personagem: cria um jogo novo */
  @Post()
  criar(@Body() dto: CriarJogoDto): EstadoJogo {
    return this.game.criar(dto);
  }

  @Get(':id')
  obter(@Param('id') id: string): EstadoJogo {
    return this.game.obter(id);
  }

  @Delete(':id')
  @HttpCode(204)
  remover(@Param('id') id: string): void {
    this.game.remover(id);
  }

  /** Game loop: o front chama a cada 1s (POST) e renderiza o `estado` retornado */
  @Post(':id/tick')
  @HttpCode(200)
  tick(@Param('id') id: string): RespostaTick {
    return this.game.tick(id);
  }

  @Post(':id/atividades/:atividadeId/iniciar')
  @HttpCode(200)
  iniciar(@Param('id') id: string, @Param('atividadeId') atividadeId: string): EstadoJogo {
    return this.game.iniciarAtividade(id, atividadeId);
  }

  @Post(':id/atividades/parar')
  @HttpCode(200)
  parar(@Param('id') id: string): EstadoJogo {
    return this.game.pararAtividade(id);
  }

  @Post(':id/equipamentos')
  @HttpCode(200)
  equipar(@Param('id') id: string, @Body() dto: EquiparDto): EstadoJogo {
    return this.game.equipar(id, dto.equipamentoId);
  }

  /** Event Log: últimos 5 eventos, do mais recente para o mais antigo */
  @Get(':id/eventos')
  eventos(@Param('id') id: string): Evento[] {
    return this.game.eventos(id);
  }

  /** Central Matemática: 6 seções com fórmula + resultado ao vivo */
  @Get(':id/central-matematica')
  central(@Param('id') id: string): SecaoCentralMatematica[] {
    return this.game.centralMatematica(id);
  }
}
