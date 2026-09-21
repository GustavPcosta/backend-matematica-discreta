import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Classe, EstadoJogo, Evento } from '../domain/tipos';

export class CriarJogoDto {
  @IsEnum(Classe, { message: 'classe deve ser: guerreiro, mago ou arqueiro' })
  classe: Classe;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nome?: string;
}

export class EquiparDto {
  @IsString()
  @IsNotEmpty()
  equipamentoId: string;
}

export interface RespostaTick {
  estado: EstadoJogo;
  segundosProcessados: number;
  novosEventos: Evento[];
}
