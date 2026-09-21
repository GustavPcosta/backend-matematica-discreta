import { Module } from '@nestjs/common';
import { CatalogoController } from './catalogo.controller';
import { GameController } from './game.controller';
import { GameRepository } from './game.repository';
import { GameService } from './game.service';
import { MathController } from './math.controller';
import { Clock, RandomService } from './runtime';

@Module({
  controllers: [GameController, CatalogoController, MathController],
  providers: [GameService, GameRepository, Clock, RandomService],
})
export class GameModule {}
