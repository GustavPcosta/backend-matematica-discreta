import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PESOS_RARIDADE_EXPLORAR } from '../domain/constantes';
import {
  probabilidadeAoMenosUmEvento,
  resumoCombinatoria,
  xpNecessario,
  xpNecessarioRecursivo,
} from '../math';

/** Endpoints matemáticos sem estado de jogo (úteis para tela de criação e Central Matemática) */
@Controller('math')
export class MathController {
  /** Combinatória: total de combinações classe × arma × armadura */
  @Get('combinatoria')
  combinatoria() {
    return resumoCombinatoria();
  }

  /** Indução: XP necessário para o nível `nivel` (recursiva e forma fechada) */
  @Get('xp/:nivel')
  xp(@Param('nivel', ParseIntPipe) nivel: number) {
    if (nivel < 1) throw new BadRequestException('nivel deve ser >= 1');
    return {
      nivel,
      recursiva: xpNecessarioRecursivo(nivel),
      formaFechada: xpNecessario(nivel),
    };
  }

  /** Probabilidade: pesos e P(≥1 evento raro/lendário em `ticks` sorteios) */
  @Get('probabilidade')
  probabilidade(@Query('ticks', new DefaultValuePipe(10), ParseIntPipe) ticks: number) {
    if (ticks < 1 || ticks > 100000) throw new BadRequestException('ticks deve estar entre 1 e 100000');
    return {
      pesos: PESOS_RARIDADE_EXPLORAR,
      ticks,
      probabilidadeAoMenosUmEvento: probabilidadeAoMenosUmEvento(ticks),
    };
  }
}
