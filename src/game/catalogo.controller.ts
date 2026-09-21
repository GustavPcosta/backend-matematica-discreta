import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { CLASSES, EQUIPAMENTOS, criarAtividadesIniciais } from '../domain/catalogo';
import { Atividade, Classe, Equipamento } from '../domain/tipos';
import { atributosDaClasse, equipamentosCompativeis } from '../math';

/** Dados estáticos para as telas de criação de personagem e equipamentos */
@Controller('catalogo')
export class CatalogoController {
  @Get('classes')
  classes() {
    return Object.values(Classe).map((classe) => ({
      classe,
      atributos: atributosDaClasse(classe),
      base: CLASSES[classe].base,
      crescimento: CLASSES[classe].crescimento,
    }));
  }

  /** ?classe=mago filtra pelos equipamentos compatíveis (relação R) */
  @Get('equipamentos')
  equipamentos(@Query('classe') classe?: string): Equipamento[] {
    if (classe === undefined) return [...EQUIPAMENTOS];
    if (!Object.values(Classe).includes(classe as Classe)) {
      throw new BadRequestException('classe deve ser: guerreiro, mago ou arqueiro');
    }
    return equipamentosCompativeis(classe as Classe);
  }

  @Get('atividades')
  atividades(): Atividade[] {
    return criarAtividadesIniciais();
  }
}
